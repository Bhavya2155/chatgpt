$pdfPath = "C:\Users\HP\.gemini\antigravity\scratch\magazine-website\Magazine\2,Grp1_Hindi_SSbA_24pages_1+5Copies-compressed.pdf"
$jsPath = "C:\Users\HP\.gemini\antigravity\scratch\magazine-website\Magazine\pdfData.js"

if (Test-Path $pdfPath) {
    Write-Output "Reading PDF..."
    $bytes = [System.IO.File]::ReadAllBytes($pdfPath)
    Write-Output "Encoding Base64..."
    $base64 = [Convert]::ToBase64String($bytes)
    $jsContent = "window.magazinePdfData = `"$base64`";"
    Write-Output "Writing to $jsPath..."
    [System.IO.File]::WriteAllText($jsPath, $jsContent)
    Write-Output "Success!"
} else {
    Write-Output "Error: PDF not found at $pdfPath"
}
