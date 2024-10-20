import { forEach } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

class SaleDetailModel {
  constructor(
    detailId,
    detailName,
    detailIsTaxable,
    detailQuantity,
    detailUnitPrice,
    detailTaxesData,
    detailIsService,
    detailIsAvailable
  ) {
    this.uuid = uuidv4();

    this.detailId = detailId ?? 0;
    this.detailName = detailName ?? '';
    this.detailIsTaxable = detailIsTaxable ?? 0;
    this.detailQuantity = detailQuantity ?? 0;
    this.detailUnitPrice = detailUnitPrice ?? 0;
    this.detailTaxesData = detailTaxesData ?? [];
    this.detailIsService = detailIsService ?? 0;
    this.detailIsAvailable = detailIsAvailable ?? true;

    this.detailUnitPriceIva = this.getDetailUnitPriceTaxValueByTaxId(this.detailTaxesData, this.detailUnitPrice, 1);
    this.detailUnitPriceFovial = this.getDetailUnitPriceTaxValueByTaxId(this.detailTaxesData, this.detailUnitPrice, 2);
    this.detailUnitPriceCotrans = this.getDetailUnitPriceTaxValueByTaxId(this.detailTaxesData, this.detailUnitPrice, 3);

    this.detailUnitPriceWithoutTax = this.calculateUnitPriceWithoutTax();
    this.detailSubTotal = this.detailQuantity * this.detailUnitPrice;

    this.detailSubTotalIva = this.getTotalTaxesByTaxId(1);
    this.detailSubTotalFovial = this.getTotalTaxesByTaxId(2);
    this.detailSubTotalCotrans = this.getTotalTaxesByTaxId(3);

    this.detailTaxableTotal = this.detailIsTaxable === 1 ? this.detailSubTotal : 0;
    this.detailNoTaxableTotal = this.detailIsTaxable === 0 ? this.detailSubTotal : 0;
    this.detailTotalTaxes = +this.calculateTotalTaxes();
    this.detailTaxableWithoutTaxesTotal = this.detailTaxableTotal - this.detailTotalTaxes;
  }

  calculateTotalTaxes() {
    return this.getDetailTotalTaxes(this.detailTaxesData, this.detailQuantity, this.detailUnitPrice);
  }

  calculateUnitPriceWithoutTax() {
    return this.detailIsTaxable === 1 
      ? this.detailUnitPrice - this.getDetailUnitPriceTaxValue(this.detailTaxesData, this.detailUnitPrice) 
      : this.detailUnitPrice;
  }

  getDetailTotalTaxes(taxesData, quantity, unitPrice) {
    let totalTaxes = 0;
    let amountToTax = parseFloat(quantity) * parseFloat(unitPrice);

    if (this.detailIsTaxable === 1) {
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 0) {
          amountToTax -= parseFloat(quantity) * parseFloat(tax.taxRate);
        }
      });

      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 1) {
          totalTaxes += (amountToTax / (1 + parseFloat(tax.taxRate))) * parseFloat(tax.taxRate);
        } else {
          totalTaxes += parseFloat(quantity) * parseFloat(tax.taxRate);
        }
      });
    }

    return (parseFloat(totalTaxes).toFixed(4) || 0);
  }

  getDetailUnitPriceTaxValue(taxesData, unitPrice) {
    let totalTaxes = 0;
    let amountToTax = parseFloat(unitPrice);

    if (this.detailIsTaxable === 1) {
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 0) {
          amountToTax -= parseFloat(tax.taxRate);
        }
      });

      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 1) {
          totalTaxes += (amountToTax / (1 + parseFloat(tax.taxRate))) * parseFloat(tax.taxRate);
        } else {
          totalTaxes += parseFloat(tax.taxRate);
        }
      });
    }

    return (parseFloat(totalTaxes).toFixed(4) || 0);
  }

  getDetailUnitPriceTaxValueByTaxId(taxesData, unitPrice, targetTaxId) {
    let totalTaxes = 0;
    let amountToTax = parseFloat(unitPrice);

    if (this.detailIsTaxable === 1) {
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 0) {
          amountToTax -= parseFloat(tax.taxRate);
        }
      });

      forEach(taxesData, (tax) => {
        if (targetTaxId === tax.taxId) {
          if (tax.isPercentage === 1) {
            totalTaxes += (amountToTax / (1 + parseFloat(tax.taxRate))) * parseFloat(tax.taxRate);
          } else {
            totalTaxes += parseFloat(tax.taxRate);
          }
        }
      });
    }

    return (parseFloat(totalTaxes).toFixed(4) || 0);
  }

  getTotalTaxesByTaxId(targetTaxId) {
    let totalTaxes = 0;
    let amountToTax = parseFloat(this.detailQuantity) * parseFloat(this.detailUnitPrice);

    if (this.detailIsTaxable === 1) {
      forEach(this.detailTaxesData, (tax) => {
        if (tax.isPercentage === 0) {
          amountToTax -= parseFloat(this.detailQuantity) * parseFloat(tax.taxRate);
        }
      });

      forEach(this.detailTaxesData, (tax) => {
        if (targetTaxId === tax.taxId) {
          if (tax.isPercentage === 1) {
            totalTaxes += (amountToTax / (1 + parseFloat(tax.taxRate))) * parseFloat(tax.taxRate);
          } else {
            totalTaxes += parseFloat(this.detailQuantity) * parseFloat(tax.taxRate);
          }
        }
      });
    }

    return (parseFloat(totalTaxes).toFixed(4) || 0);
  }
}

export default SaleDetailModel;
