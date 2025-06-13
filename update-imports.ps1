$files = Get-ChildItem -Path "E:\global-saanvika-ecommerce" -Recurse -Include "*.tsx","*.ts","*.jsx","*.js" -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Update auth component imports
    $content = $content -replace '@/components/auth-provider', '@/components/auth/auth-provider'
    $content = $content -replace '@/components/auth-loading', '@/components/auth/auth-loading'
    $content = $content -replace '@/components/auth-wrapper', '@/components/auth/auth-wrapper'
    $content = $content -replace '@/components/protected-route', '@/components/auth/protected-route'
    
    # Update cart component imports
    $content = $content -replace '@/components/cart-provider', '@/components/cart/cart-provider'
    $content = $content -replace '@/components/cart-notification', '@/components/cart/cart-notification'
    
    # Update firebase component imports
    $content = $content -replace '@/components/firebase-setup-checker', '@/components/firebase/firebase-setup-checker'
    $content = $content -replace '@/components/firebase-status', '@/components/firebase/firebase-status'
    $content = $content -replace '@/components/image-upload', '@/components/firebase/image-upload'
    
    # Update common component imports
    $content = $content -replace '@/components/error-boundary', '@/components/common/error-boundary'
    $content = $content -replace '@/components/footer', '@/components/common/footer'
    $content = $content -replace '@/components/navbar', '@/components/common/navbar'
    $content = $content -replace '@/components/providers', '@/components/common/providers'
    $content = $content -replace '@/components/search-bar', '@/components/common/search-bar'
    $content = $content -replace '@/components/search-filter-bar', '@/components/common/search-filter-bar'
    $content = $content -replace '@/components/simple-dropdown', '@/components/common/simple-dropdown'
    $content = $content -replace '@/components/theme-provider', '@/components/common/theme-provider'
    
    # Update home component imports
    $content = $content -replace '@/components/featured-collections', '@/components/home/featured-collections'
    $content = $content -replace '@/components/hero-section', '@/components/home/hero-section'
    $content = $content -replace '@/components/category-preview', '@/components/home/category-preview'
    
    # Update category component imports
    $content = $content -replace '@/components/category-content', '@/components/category/category-content'
    
    # Update lib imports
    $content = $content -replace '@/lib/auth-helper', '@/lib/auth/auth-helper'
    $content = $content -replace '@/lib/customer-service', '@/lib/services/customer-service'
    $content = $content -replace '@/lib/dashboard-service', '@/lib/services/dashboard-service'
    $content = $content -replace '@/lib/data-extraction', '@/lib/services/data-extraction'
    $content = $content -replace '@/lib/cors-storage-fix', '@/lib/utils/cors-storage-fix'
    $content = $content -replace '@/lib/image-utils', '@/lib/utils/image-utils'
    $content = $content -replace '@/lib/utils', '@/lib/utils/common'
    
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Import paths updated successfully!"
