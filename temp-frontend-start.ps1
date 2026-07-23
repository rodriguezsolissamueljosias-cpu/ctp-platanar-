$VerbosePreference = 'Continue'
Set-Location 'C:\Users\san29\OneDrive\Escritorio\ctp-platanar\ctp-platanar-frontend'

# Verificar e instalar dependencias si es necesario
if (-not (Test-Path 'node_modules')) {
    Write-Host 'Instalando dependencias del frontend...' -ForegroundColor Yellow
    npm install
}

Write-Host 'Frontend iniciado. Se abrirá en tu navegador automáticamente.' -ForegroundColor Green
Write-Host ''
npm start
npm .\start-app.ps1