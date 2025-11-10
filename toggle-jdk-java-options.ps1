
# Script quản lý biến JDK_JAVA_OPTIONS cho LogiGear TestArchitect
# ---------------------------------------------------------------
# Cách sử dụng:
# 1. Tạo biến (nếu chưa có):
#    .\toggle-jdk-java-options.ps1 -Action create
# 2. Bật biến (đặt đúng giá trị cho LogiGear):
#    .\toggle-jdk-java-options.ps1 -Action enable
# 3. Tắt biến (xóa khỏi môi trường):
#    .\toggle-jdk-java-options.ps1 -Action disable
# ---------------------------------------------------------------


param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("enable", "disable", "create")]
    [string]$Action
)


$envName = "JDK_JAVA_OPTIONS"
$logigearValue = "--add-opens=java.desktop/javax.swing=ALL-UNNAMED --add-opens=java.desktop/java.awt=ALL-UNNAMED"

function Get-Env {
    return [System.Environment]::GetEnvironmentVariable($envName, "User")
}

switch ($Action) {
    "create" {
        if (-not (Get-Env)) {
            [System.Environment]::SetEnvironmentVariable($envName, $logigearValue, "User")
            Write-Host "Đã tạo biến $envName cho LogiGear với giá trị: $logigearValue"
        } else {
            Write-Host "Biến $envName đã tồn tại."
        }
    }
    "enable" {
        [System.Environment]::SetEnvironmentVariable($envName, $logigearValue, "User")
        Write-Host "Đã bật biến $envName cho LogiGear với giá trị: $logigearValue"
    }
    "disable" {
        [System.Environment]::SetEnvironmentVariable($envName, $null, "User")
        Write-Host "Đã tắt biến $envName cho LogiGear."
    }
    default {
        Write-Host "Tham số không hợp lệ. Sử dụng enable, disable hoặc create."
    }
}
