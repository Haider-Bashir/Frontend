// components/Services.jsx
import React from "react";

const Services = () => {
    const services = [
        { id: 1, name: "Consultancy Services", description: "Expert guidance for your needs." },
        { id: 2, name: "Visa Assistance", description: "Making your travel dreams a reality." },
        { id: 3, name: "Career Guidance", description: "Helping you achieve your goals." },
    ];

    return (
        <section id="services" className="py-16 bg-gray-100">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-10">Our Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="p-6 bg-white shadow-md rounded-lg text-center">
                            <h3 className="text-xl font-bold mb-4">{service.name}</h3>
                            <p className="text-gray-700">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
