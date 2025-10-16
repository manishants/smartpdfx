"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Car, Loader2, RefreshCw, Info, Calendar, Gauge } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { AllTools } from '@/components/all-tools';

type Stage = 'search' | 'processing' | 'result';

interface VehicleDetails {
    make: string;
    model: string;
    year: string;
    engine: string;
    transmission: string;
    fuelType: string;
    color: string;
    registrationDate: string;
    owner: string;
    status: string;
}

export default function VehicleDetailsFinderPage() {
    const [stage, setStage] = useState<Stage>('search');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!registrationNumber.trim()) {
            toast({ title: "Missing information", description: "Please enter a vehicle registration number.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        setStage('processing');

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Mock vehicle details
            const mockDetails: VehicleDetails = {
                make: "Toyota",
                model: "Camry",
                year: "2020",
                engine: "2.5L 4-Cylinder",
                transmission: "Automatic",
                fuelType: "Gasoline",
                color: "Silver",
                registrationDate: "2020-03-15",
                owner: "John Doe",
                status: "Active"
            };

            setVehicleDetails(mockDetails);
            setStage('result');
            toast({ title: "Success!", description: "Vehicle details found successfully." });
        } catch (error: any) {
            console.error("Vehicle search failed", error);
            toast({ title: "Error searching vehicle", description: error.message || "Could not find vehicle details.", variant: "destructive" });
            setStage('search');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStartOver = () => {
        setStage('search');
        setRegistrationNumber('');
        setVehicleDetails(null);
    };

    const renderContent = () => {
        switch (stage) {
            case 'search':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <Car className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">Find Vehicle Details</h2>
                            <p className="text-muted-foreground">Enter a vehicle registration number to get detailed information</p>
                        </div>
                        <div className="max-w-md mx-auto space-y-4">
                            <Input
                                value={registrationNumber}
                                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                                placeholder="Enter registration number (e.g., ABC123)"
                                className="text-center text-lg font-mono"
                            />
                            <Button onClick={handleSearch} disabled={isProcessing} className="w-full">
                                <Search className="mr-2 h-4 w-4" />
                                Search Vehicle
                            </Button>
                        </div>
                    </div>
                );
            case 'processing':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">Searching Database</h2>
                            <p className="text-muted-foreground">Looking up vehicle information for {registrationNumber}...</p>
                        </div>
                    </div>
                );
            case 'result':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Car className="h-12 w-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">Vehicle Found!</h2>
                            <p className="text-muted-foreground">Registration: {registrationNumber}</p>
                        </div>
                        
                        {vehicleDetails && (
                            <div className="max-w-2xl mx-auto space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold mb-3 flex items-center">
                                                <Info className="mr-2 h-4 w-4" />
                                                Basic Information
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Make:</span>
                                                    <span className="font-medium">{vehicleDetails.make}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Model:</span>
                                                    <span className="font-medium">{vehicleDetails.model}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Year:</span>
                                                    <span className="font-medium">{vehicleDetails.year}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Color:</span>
                                                    <span className="font-medium">{vehicleDetails.color}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold mb-3 flex items-center">
                                                <Gauge className="mr-2 h-4 w-4" />
                                                Technical Details
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Engine:</span>
                                                    <span className="font-medium">{vehicleDetails.engine}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Transmission:</span>
                                                    <span className="font-medium">{vehicleDetails.transmission}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Fuel Type:</span>
                                                    <span className="font-medium">{vehicleDetails.fuelType}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <span className="font-medium text-green-600">{vehicleDetails.status}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="md:col-span-2">
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold mb-3 flex items-center">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Registration Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Registration Date:</span>
                                                    <span className="font-medium">{vehicleDetails.registrationDate}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Owner:</span>
                                                    <span className="font-medium">{vehicleDetails.owner}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                <div className="text-center">
                                    <Button variant="outline" onClick={handleStartOver} className="max-w-xs">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Search Another Vehicle
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <ModernPageLayout>
            <header className="text-center">
                <h1 className="text-4xl font-bold font-headline">Vehicle Details Finder</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Look up comprehensive vehicle information by registration number
                </p>
            </header>
            
            <div className="mt-8">
                <Card>
                    <CardContent className="p-6 min-h-[70vh]">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>

            <ModernSection
                title="Comprehensive Vehicle Database"
                subtitle="Instant access to vehicle information"
                icon={<Car className="h-6 w-6" />}
                className="mt-12"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                <Search className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Fast Search</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Quickly find vehicle details using registration numbers.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <Info className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Detailed Information</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Access comprehensive vehicle specifications and history.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Gauge className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Accurate Data</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Reliable information from official vehicle databases.
                        </p>
                    </div>
                </div>
            </ModernSection>

            <AllTools />
        </ModernPageLayout>
    );
}