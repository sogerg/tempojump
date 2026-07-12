const { withAppBuildGradle } = require('expo/config-plugins');

// Fait pointer les builds release vers la clé d'upload TempoJump au lieu du keystore de
// debug. Les identifiants (chemin du fichier, mots de passe) vivent dans le
// gradle.properties global de la machine (~/.gradle/gradle.properties), jamais dans le
// dépôt. Ce plugin doit re-appliquer ce réglage à chaque `expo prebuild`, qui régénère
// android/app/build.gradle à partir de zéro.
const RELEASE_SIGNING_CONFIG = `
        release {
            storeFile file(TEMPOJUMP_RELEASE_STORE_FILE)
            storePassword TEMPOJUMP_RELEASE_STORE_PASSWORD
            keyAlias TEMPOJUMP_RELEASE_KEY_ALIAS
            keyPassword TEMPOJUMP_RELEASE_KEY_PASSWORD
        }
    }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    const beforeSigningConfigs = contents;
    contents = contents.replace(
      /(signingConfigs\s*\{\s*debug\s*\{[^}]*\}\s*)\}/,
      `$1${RELEASE_SIGNING_CONFIG}`
    );
    if (contents === beforeSigningConfigs) {
      console.warn('[withReleaseSigning] signingConfigs.debug block introuvable, clé release non ajoutée.');
    }

    const beforeBuildType = contents;
    contents = contents.replace(
      /(release\s*\{\s*)\/\/ Caution![^\n]*\n\s*\/\/ see[^\n]*\n\s*signingConfig signingConfigs\.debug/,
      `$1signingConfig signingConfigs.release`
    );
    if (contents === beforeBuildType) {
      console.warn('[withReleaseSigning] buildTypes.release introuvable, signingConfig non remplacé.');
    }

    config.modResults.contents = contents;
    return config;
  });
};
