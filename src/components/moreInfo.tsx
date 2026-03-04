import { Card, CardHeader, CardTitle  } from "@/components/ui/card";
const tours = [
  { 
    title: 'Crafty Package', 
    route: '/publications',
    image: '/crafty.png',
  },
  { 
    title: 'Farmtastic Package', 
    route: '/grants',
    image: '/farmtastic.png',
  },
  { 
    title: 'Moo Moo Package', 
    route: '/labs',
    image: '/moomoo.png',
  },
  { 
    title: 'Eden Package', 
    route: '/events',
    image: '/eden.png',
  },
];

const InfoSection = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">     
        <h1 className="text-4xl text-center mb-8" style={{ color: "#00a888"}} >Our Packages</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map((tour, index) => (
            <Card 
            key={index} 
            className="relative h-64 flex flex-col justify-end overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${tour.image})` }}
            >
              <CardHeader className="relative z-10">
                <CardTitle className="text-3xl text-white">
                {tour.title}
                </CardTitle>
              </CardHeader>
              <div
                className="absolute bottom-0 w-full h-1/3 z-0"
                style={{
                  background: "linear-gradient(to top, rgba(4, 105, 81, 0.8), rgba(4, 105, 81, 0.0))"
                }}
              ></div>
            </Card>
          ))}
        </div>
      </div>
    </section>     
  );
};

export { InfoSection }