export const SECRET_FILE_PATTERNS = [
/^\.env$/i,          // Exact .env file only
/\.env\/|\/.env$/i,  // .env file in paths or as final segment
/id_rsa/i,
/id_dsa/i,
/\.pem$/i,
/\.key$/i,
/\.p12$/i,
/\.crt$/i,
/credentials/i,
/secret/i
];
export const LIGHTWEIGHT_BASE_IMAGE_HINTS: Record<string, string> = {
node: 'node:20-alpine',
python: 'python:3.12-slim',
golang: 'golang:1.24-alpine',
nginx: 'nginx:alpine',
openjdk: 'eclipse-temurin:21-jre-jammy'
};

export const PACKAGE_MANAGER_INSTALL_REGEX = /(apt-get\s+install|apk\s+add|yum\s+install|dnf\s+install)/i;
export const CURL_BASH_REGEX = /(curl|wget)[^\n|]*\|\s*(bash|sh)/i;