import Navbar from "@/components/common/navbar"
import HeroSection from "@/components/home/hero-section"
import FeaturedCollections from "@/components/home/featured-collections"
import CategoryPreview from "@/components/home/category-preview"
import Footer from "@/components/common/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedCollections />
      <CategoryPreview />
      <Footer />
    </div>
  )
}

