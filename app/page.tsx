import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import FeaturedCollections from "@/components/featured-collections"
import CategoryPreview from "@/components/category-preview"
import Footer from "@/components/footer"

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
