// Script to update existing products to be featured
// This is a one-time script to fix the issue where existing products aren't showing on homepage

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  // You can get this from your Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateProductsToFeatured() {
  try {
    console.log('Fetching all products...');
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`Found ${snapshot.size} products`);
    
    const updatePromises = [];
    
    snapshot.forEach((productDoc) => {
      const productData = productDoc.data();
      console.log(`Updating product: ${productData.name}`);
      
      // Update the product to be featured
      updatePromises.push(
        updateDoc(doc(db, 'products', productDoc.id), {
          featured: true,
          updatedAt: new Date()
        })
      );
    });
    
    await Promise.all(updatePromises);
    console.log('✅ All products updated to be featured!');
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
  }
}

// Run the script
updateProductsToFeatured();
