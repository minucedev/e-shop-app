# Script tu dong cap nhat IP trong .env.local

# Lay IPv4 address tu Wi-Fi hoac Ethernet (uu tien 192.168.x.x va 10.x.x.x)
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -match 'Wi-Fi|Ethernet' -and 
    $_.IPAddress -notmatch '^169\.|^172\.|^127\.' -and
    ($_.IPAddress -match '^192\.168\.' -or $_.IPAddress -match '^10\.')
} | Select-Object -First 1).IPAddress

# Neu khong tim thay, thu lai voi bat ky IP nao khong phai virtual
if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.InterfaceAlias -match 'Wi-Fi|Ethernet' -and 
        $_.IPAddress -notmatch '^169\.|^172\.|^127\.'
    } | Select-Object -First 1).IPAddress
}

if ($ip) {
    Write-Host "Tim thay IP: $ip" -ForegroundColor Green
    
    # Doc file .env.local
    $envFile = ".\.env.local"
    $content = Get-Content $envFile -Raw
    
    # Thay the IP cu bang IP moi
    $newContent = $content -replace 'http://\d+\.\d+\.\d+\.\d+:', "http://${ip}:"
    
    # Ghi lai file
    Set-Content -Path $envFile -Value $newContent
    
    Write-Host "Da cap nhat .env.local voi IP: $ip" -ForegroundColor Green
    Write-Host ""
    Write-Host "API Base URL: http://${ip}:8081/api" -ForegroundColor Cyan
    Write-Host "Image Base URL: http://${ip}:8081/uploads" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Luu y: Can restart/rebuild app de thay doi co hieu luc!" -ForegroundColor Yellow
} else {
    Write-Host "Khong tim thay IP. Vui long kiem tra ket noi mang." -ForegroundColor Red
}
