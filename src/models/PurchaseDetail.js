import { forEach } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

class PurchaseDetailModel {
  constructor(
    detailId,
    detailName,
    detailIsTaxable,
    detailQuantity,
    detailUnitCost,
    detailTaxesData,
    detailIsService,
    detailIsAvailable,
    detailIsBonus
    ) {
    this.uuid = uuidv4();

    this.detailId = detailId ?? 0;
    this.detailTaxesData = detailTaxesData ?? [];

    this.detailName = detailName ?? '';

    this.detailIsTaxable = detailIsTaxable ?? 0;

    this.detailQuantity = detailQuantity ?? 0;

    // this.detailBlocks = detailBlocks != null ? detailBlocks : 0;

    this.detailUnitCost = detailUnitCost ?? 0;

    this.detailIsBonus = detailIsBonus ?? true;
    
    this.detailUnitCostFovial = +this.getDetailUnitCostTaxValueByTaxId(this.detailTaxesData, this.detailUnitCost, 2);
    this.detailUnitCostCotrans = +this.getDetailUnitCostTaxValueByTaxId(this.detailTaxesData, this.detailUnitCost, 3);

    this.detailSubTotal = this.detailQuantity * this.detailUnitCost;

    this.detailTaxableTotal = this.detailIsTaxable === 1 ? this.detailSubTotal : 0;

    this.detailFovial = +this.getTotalTaxesByTaxId(2);
    this.detailCotrans = +this.getTotalTaxesByTaxId(3);

    this.detailNoTaxableTotal = this.detailIsTaxable === 0 ? this.detailSubTotal : 0;

    this.detailTotalTaxes = +this.calculateTotalTaxes();

    this.detailTaxableWithTaxesTotal = this.detailTaxableTotal + this.detailTotalTaxes;


    this.detailIsService = detailIsService ?? 0;

    this.detailIsAvailable = detailIsAvailable ?? true;
  }

  calculateTotalTaxes() {
    return this.getDetailTotalTaxes(this.detailTaxesData, this.detailQuantity, this.detailUnitCost);
  }

  getDetailTotalTaxes(taxesData, quantity, unitCost) {
    let totalTaxes = 0;
    let amountToTax = parseFloat(quantity) * parseFloat(unitCost);

    if (this.detailIsTaxable === 1 && this.detailIsBonus === false) {
      // AÑADIR LOS TAXES PORCENTUALES
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 1) {
          totalTaxes += (amountToTax * parseFloat(tax.taxRate));
        }
      });

      // AÑADIR LOS TAXES FIJOS
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 0) {
          totalTaxes += parseFloat(quantity) * parseFloat(tax.taxRate);
        }
      });
    }

    return (parseFloat(totalTaxes).toFixed(4) || 0);
  }

  getDetailUnitCostTaxValue(taxesData, unitCost) {
    let totalTaxes = 0;
    let amountToTax = parseFloat(unitCost);

    if (this.detailIsTaxable === 1 && this.detailIsBonus === false) {
      // AÑADIR LOS TAXES PORCENTUALES
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 1) {
          totalTaxes += (amountToTax * parseFloat(tax.taxRate));
        }
      });

      // AÑADIR LOS TAXES FIJOS
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 0) {
          totalTaxes += parseFloat(tax.taxRate);
        }
      });
    }

    return (parseFloat(totalTaxes).toFixed(4) || 0);
  }

  getDetailUnitCostTaxValueByTaxId(taxesData, unitCost, targetTaxId) {
    let totalTaxes = 0;
    let amountToTax = parseFloat(unitCost);

    if (this.detailIsTaxable === 1 && this.detailIsBonus === false) {
      // AÑADIR LOS TAXES PORCENTUALES
      forEach(taxesData, (tax) => {
        if (targetTaxId === tax.taxId) {
          if (tax.isPercentage === 1) {
            totalTaxes += (amountToTax * parseFloat(tax.taxRate));
          }
        }
      });

      // AÑADIR LOS TAXES FIJOS
      forEach(taxesData, (tax) => {
        if (targetTaxId === tax.taxId) {
          if (tax.isPercentage === 0) {
            totalTaxes += parseFloat(tax.taxRate);
          }
        }
      });
    }

    return (parseFloat(totalTaxes).toFixed(4) || 0);
  }

  getTotalTaxesByTaxId(targetTaxId) {
    let totalTaxes = 0;
    let amountToTax = parseFloat(this.detailQuantity) * parseFloat(this.detailUnitCost);

    if (this.detailIsTaxable === 1 && this.detailIsBonus === false) {
      forEach(this.detailTaxesData, (tax) => {
        if (targetTaxId === tax.taxId) {
          if (tax.isPercentage === 1) {
            totalTaxes += amountToTax * parseFloat(tax.taxRate);
          }
        }
      });

      forEach(this.detailTaxesData, (tax) => {
        if (targetTaxId === tax.taxId) {
          if (tax.isPercentage === 0) {
            totalTaxes += parseFloat(this.detailQuantity) * parseFloat(tax.taxRate);
          }
        }
      });
    }

    return (parseFloat(totalTaxes).toFixed(4) || 0);
  }

  // getDetailTotalTaxes(taxesData, quantity, unitCost) {
  //   let totalTaxes = 0; 
    
  //   if (this.detailIsTaxable === 1) {
  //     forEach(taxesData, (tax) => {
  //       if (tax.isPercentage === 1) {
  //         let subTotal = (quantity * unitCost);
  //         let taxRate = (+tax.taxRate);

  //         totalTaxes += (subTotal * taxRate);
  //       } else {
  //         totalTaxes += (quantity * ++tax.taxRate);
  //       }
  //     })
  //   }
  //   return totalTaxes || 0;
  // }

  // getDetailunitCostTaxValue(taxesData, unitCost) {
  //   let totalTaxes = 0; 
    
  //   if (this.detailIsTaxable === 1) {
  //     forEach(taxesData, (tax) => {
  //       if (tax.isPercentage === 1) {
  //         totalTaxes += (((unitCost) / (1 + +tax.taxRate)) * +tax.taxRate);
  //       } else {
  //         totalTaxes += (unitCost + ++tax.taxRate);
  //       }
  //     })
  //   }
  //   return totalTaxes || 0;
  // }
}

// { 
//   index: docDetails.length,
//   detailId: detailSelected, 
//   detailName: find(productsData, ['productId', detailSelected]).productName,
//   detailQuantity: detailQuantity || 1,
//   detailUnitCost: detailUnitCost,
//   detailSubTotal: detailQuantity * detailUnitCost
// }

export default PurchaseDetailModel;
