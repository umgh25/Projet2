// This file defines the Participation interface, which represents the participation details of an athlete in a specific city and year.

export interface Participation {
    city: string;
    year: number;
    medalsCount: number;
    athletesCount: number;
}