/* Types */
export type CreateTripBody = {
    location: string;
    mountain: string;
    description: string;
    startDate: Date;
    endDate: Date;
    travelMethod: string;
    lodgingMethod: string;
    capacity?: number;
};

export type UpdateTripBody = {
    location?: string;
    mountain?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    travelMethod?: string;
    lodgingMethod?: string;
    capacity?: number;
};
