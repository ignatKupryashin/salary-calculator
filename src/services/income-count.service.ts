import type {IncomeTaxRate} from "../models/income-tax-rate.ts";

const calculateTax = (income: number, taxRates: IncomeTaxRate[]): {rate: number, taxValue: number}[] => {
    const result: {rate: number, taxValue: number}[] = [];
    for (let i = 0; i < taxRates.length; i++) {
        if (income <= 0) {
            break;
        }

        let currentRateTax = 0;

        if (taxRates[i].income !== null && income > taxRates[i].income!) {
            currentRateTax = taxRates[i].income! * taxRates[i].rate
        } else {
            currentRateTax = income * taxRates[i].rate
        }

        result.push({
            rate: taxRates[i].rate,
            taxValue: currentRateTax
        })

        if (taxRates[i].income !== null) {
            income = income - taxRates[i].income!;
        }
    }
    return result;
}

export { calculateTax }