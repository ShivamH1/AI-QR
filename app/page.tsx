import HeroSection from "@/components/home/HeroSection";
import GeneratorForm from "@/components/home/GeneratorForm";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-32">
        <GeneratorForm />
      </section>
    </>
  );
}
