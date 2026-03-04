
const HeroSection = () => {

  return (
    <section className="relative overflow-hidden py-32 sm:py-60">
      <div className="absolute inset-0">
        <img
          alt="background"
          src="/banner.jpg"
          className="w-full h-full object-cover "
        />
      </div>
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="mt-6 flex justify-center gap-3">
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };