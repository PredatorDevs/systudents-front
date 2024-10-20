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

    this.detailId = detailId != null ? detailId : 0;

    this.detailName = detailName != null ? detailName : '';

    this.detailIsTaxable = detailIsTaxable != null ? detailIsTaxable : '';

    this.detailQuantity = detailQuantity != null ? detailQuantity : 0;

    this.detailUnitPrice = detailUnitPrice != null ? detailUnitPrice : 0;

    this.detailUnitPriceWithoutTax = detailUnitPrice != null ? detailUnitPrice - this.getDetailUnitPriceTaxValue(detailTaxesData, detailUnitPrice) : 0;

    this.detailSubTotal = this.detailQuantity * this.detailUnitPrice;

    this.detailTaxableTotal = this.detailIsTaxable === 1 ? this.detailQuantity * this.detailUnitPrice : 0;

    this.detailNoTaxableTotal = this.detailIsTaxable === 0 ? this.detailQuantity * this.detailUnitPrice : 0;
    
    this.detailTotalTaxes = this.getDetailTotalTaxes(detailTaxesData, detailQuantity, detailUnitPrice) || 0;

    this.detailTaxableWithoutTaxesTotal = this.detailTaxableTotal - this.detailTotalTaxes;

    this.detailTaxesData = detailTaxesData != null ? detailTaxesData : [];

    this.detailIsService = detailIsService != null ? detailIsService : 0;

    this.detailIsAvailable = detailIsAvailable != null ? detailIsAvailable : true;

    this.getDetailTotalTaxesByTaxId = function(targetTaxId) {
      let totalTaxes = 0;
      let amountToTax = (+this.detailQuantity * +this.unitPrice);
      
      if (this.detailIsTaxable === 1) {
        // UN FOREACH PARA DESCONTAR LOS TAX FIJOS DEL AMOUNT TO TAX
        forEach(this.detailTaxesData, (tax) => {
          if (tax.isPercentage === 0) {
            amountToTax -= (+this.detailQuantity + +tax.taxRate);
          }
        });
  
        forEach(this.detailTaxesData, (tax) => {
          if (targetTaxId === tax.taxId) {
            if (tax.isPercentage === 1) {
              totalTaxes += ((amountToTax / (1 + +tax.taxRate)) * +tax.taxRate);
            } else {
              totalTaxes += (this.detailQuantity * +tax.taxRate);
            }
          }
        });
      }
  
      return Number(totalTaxes).toFixed(4) || 0;
    }
  }

  getDetailTotalTaxes(taxesData, quantity, unitPrice) {
    let totalTaxes = 0;
    let amountToTax = (+quantity * +unitPrice);
    
    if (this.detailIsTaxable === 1) {
      // UN FOREACH PARA DESCONTAR LOS TAX FIJOS DEL AMOUNT TO TAX
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 0) {
          amountToTax -= (+quantity * +tax.taxRate);
        }
      });

      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 1) {
          totalTaxes += ((amountToTax / (1 + +tax.taxRate)) * +tax.taxRate);
        } else {
          totalTaxes += (quantity * +tax.taxRate);
        }
      })
    }

    return Number(totalTaxes).toFixed(4) || 0;
  }

  getDetailUnitPriceTaxValue(taxesData, unitPrice) {
    let totalTaxes = 0;
    let amountToTax = (+unitPrice);

    if (this.detailIsTaxable === 1) {
      // UN FOREACH PARA DESCONTAR LOS TAX FIJOS DEL AMOUNT TO TAX
      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 0) {
          amountToTax -= (+tax.taxRate);
        }
      });

      forEach(taxesData, (tax) => {
        if (tax.isPercentage === 1) {
          totalTaxes += ((amountToTax / (1 + +tax.taxRate)) * +tax.taxRate);
        } else {
          totalTaxes += (+tax.taxRate);
        }
      })
    }
    
    return Number(totalTaxes).toFixed(4) || 0;
  }
}

// { 
//   index: docDetails.length,
//   detailId: detailSelected, 
//   detailName: find(productsData, ['productId', detailSelected]).productName,
//   detailQuantity: detailQuantity || 1,
//   detailUnitPrice: detailUnitPrice,
//   detailSubTotal: detailQuantity * detailUnitPrice
// }

export default SaleDetailModel;
