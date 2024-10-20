// ADMIN
import brandIcon from '../img/icons/admin/brand.png';
import customersIcon from '../img/icons/admin/customers.png';
import generalDataIcon from '../img/icons/admin/general-data.png';
import generalInformationIcon from '../img/icons/admin/general-information.png';
import pinIcon from '../img/icons/admin/pin.png';
import placesIcon from '../img/icons/admin/places.png';
import productBrandIcon from '../img/icons/admin/product-brand.png';
import productLineIcon from '../img/icons/admin/product-line.png';
import providerIcon from '../img/icons/admin/provider.png';
import rolesIcon from '../img/icons/admin/roles.png';
import routesIcon from '../img/icons/admin/routes.png';
import salesAgentIcon from '../img/icons/admin/sales-agents.png';
import supplierIcon from '../img/icons/admin/supplier.png';
import trackIcon from '../img/icons/admin/track.png';
import usersIcon from '../img/icons/admin/users.png';

// ATTACHMENTS
import pdfFileIcon from '../img/icons/attachments/pdf.png';

// DOCS
import addFileIcon from '../img/icons/docs/add-file.png';
import addFolderIcon from '../img/icons/docs/add-folder.png';
import booksIcon from '../img/icons/docs/books.png';
import saleReportIcon from '../img/icons/docs/salereport.png';

// INVENTORY
import bottlesIcon from '../img/icons/inventory/bottles.png';
import materialsIcon from '../img/icons/inventory/materials.png';
import inIcon from '../img/icons/inventory/in.png';
import in2Icon from '../img/icons/inventory/in2.png';
import outIcon from '../img/icons/inventory/out.png';
import out2Icon from '../img/icons/inventory/out2.png';
import shelveIcon from '../img/icons/inventory/shelve.png';

// MAIN
import administrationIcon from '../img/icons/main/administration.png';
import administratorIcon from '../img/icons/main/administrator.png';
import cashierThreeIcon from '../img/icons/main/cashier-three.png';
import cashierTwoIcon from '../img/icons/main/cashier-two.png';
import cashierIcon from '../img/icons/main/cashier.png';
import contractIcon from '../img/icons/main/contract.png';
import dispatchIcon from '../img/icons/main/dispatch.png';
import expensesIcon from '../img/icons/main/expenses.png';
import generalReportsIcon from '../img/icons/main/general-reports.png';
import inventoryIcon from '../img/icons/main/inventory.png';
import inventoryTwoIcon from '../img/icons/main/inventory-two.png';
import kardexIcon from '../img/icons/main/kardex.png';
import ordersIcon from '../img/icons/main/orders.png';
import pendingAccountsIcon from '../img/icons/main/pending-accounts.png';
import pendingPurchasesIcon from '../img/icons/main/pending-purchases.png';
import pendingSalesIcon from '../img/icons/main/pending-sales.png';
import petrol1Icon from '../img/icons/petrol1.png';
import petrol2Icon from '../img/icons/petrol2.png';
import petrol3Icon from '../img/icons/petrol3.png';
import policyIcon from '../img/icons/main/policy.png';
import printerIcon from '../img/icons/main/printer.png';
import productionIcon from '../img/icons/main/production.png';
import purchasesIcon from '../img/icons/main/purchases.png';
import reportsIcon from '../img/icons/main/reports.png';
import requisitionsIcon from '../img/icons/main/requisition.png';
import shippingIcon from '../img/icons/main/shipping.png';
import truckIcon from '../img/icons/main/truck.png';

// GENERAL
import addIcon from '../img/icons/general/add.png';
import add1Icon from '../img/icons/general/add1.png';
import editIcon from '../img/icons/general/edit.png';
import editUserIcon from '../img/icons/general/edituser.png';
import goBackIcon from '../img/icons/general/goback.png';
import logoutIcon from '../img/icons/general/logout.png';
import refreshIcon from '../img/icons/general/refresh.png';
import addUserIcon from '../img/icons/general/adduser.png';
import searchForIcon from '../img/icons/general/searchfor.png';

// ICONS
import addProductIcon from '../img/icons/add-product.png';
import supplier2Icon from '../img/icons/supplier.png';
import cashPaymentIcon from '../img/icons/cashpayment.png';
import creditPaymentIcon from '../img/icons/creditpayment.png';
import ticketIcon from '../img/icons/ticket.png';
import invoice2Icon from '../img/icons/invoice2.png';
import invoiceTax2Icon from '../img/icons/invoicetax2.png';
import creditNoteIcon from '../img/icons/creditnote.png';
import debitNoteIcon from '../img/icons/debitnote.png';
import productsIcon from '../img/icons/products.png';
import clearIcon from '../img/icons/clear.png';
import cashMethodIcon from '../img/icons/cashmethod.png';
import cardMethodIcon from '../img/icons/cardmethod.png';
import paymentCheckMethodIcon from '../img/icons/paymentcheckmethod.png';
import transferMethodIcon from '../img/icons/transfermethod.png';
import restoreIcon from '../img/icons/restore.png';
import personIcon from '../img/icons/person.png';
import person1Icon from '../img/icons/person1.png';
import person2Icon from '../img/icons/person2.png';

// MENU

import menuAddDocument from '../img/icons/menu/adddocument.png';
import menuBinderIcon from '../img/icons/menu/binder.png';
import menuBinder2Icon from '../img/icons/menu/binder2.png';
import menuBinder3Icon from '../img/icons/menu/binder3.png';
import menuBinder4Icon from '../img/icons/menu/binder4.png';
import menuBinder5Icon from '../img/icons/menu/binder5.png';
import menuBrandsIcon from '../img/icons/menu/brands.png';
import menuCategoriesIcon from '../img/icons/menu/categories.png';
import menuCheckoutIcon from '../img/icons/menu/checkout.png';
import menuCustomersIcon from '../img/icons/menu/customers.png';
import menuDueAccountIcon from '../img/icons/menu/dueaccount.png';
import menuDueAccountIcon1 from '../img/icons/menu/dueaccount1.png';
import menuEmployeesIcon from '../img/icons/menu/employees.png';
import menuExpensesIcon from '../img/icons/menu/expenses.png';
import menuHomeIcon from '../img/icons/menu/home.png';
import menuPurchasesIcon from '../img/icons/menu/purchases.png';
import menuSettingsIcon from '../img/icons/menu/settings.png';
import menuSummaryIcon from '../img/icons/menu/summary.png';

const ImageProvider = ({
  fileRoute,
  width = '100px',
  addBackground = false,
  colorBackground = 'transparent',
  backgroundMargin = 10,
  backgroundPadding = 10,
  borderRadius = 0
}) => (
  <img
    alt="example"
    src={fileRoute}
    style={{
      width,
      margin: addBackground ? backgroundMargin : 0, 
      padding: addBackground ? backgroundPadding : 0,
      backgroundColor: colorBackground,
      borderRadius: borderRadius,
    }}
  />
)

// Función para crear componentes de iconos
const createIconComponent = (fileRoute) => ({
  width = '100px',
  addBackground = false,
  colorBackground = 'transparent',
  bgMargin = 0,
  bgPadding = 0,
}) => (
  <ImageProvider
    fileRoute={fileRoute}
    width={width}
    addBackground={addBackground}
    colorBackground={colorBackground}
    backgroundMargin={bgMargin}
    backgroundPadding={bgPadding}
  />
);

// ADMIN
export const GBrandIcon = createIconComponent(brandIcon);
export const GCustomersIcon = createIconComponent(customersIcon);
export const GGeneralDataIcon = createIconComponent(generalDataIcon);
export const GGeneralInformationIcon = createIconComponent(generalInformationIcon);
export const GPinIcon = createIconComponent(pinIcon);
export const GPlacesIcon = createIconComponent(placesIcon);
export const GProductBrandIcon = createIconComponent(productBrandIcon);
export const GProductLineIcon = createIconComponent(productLineIcon);
export const GProviderIcon = createIconComponent(providerIcon);
export const GRolesIcon = createIconComponent(rolesIcon);
export const GRoutesIcon = createIconComponent(routesIcon);
export const GSalesAgentIcon = createIconComponent(salesAgentIcon);
export const GSupplierIcon = createIconComponent(supplierIcon);
export const GTrackIcon = createIconComponent(trackIcon);
export const GUsersIcon = createIconComponent(usersIcon);

//ATTACHMENTS
export const GPdfFileIcon = createIconComponent(pdfFileIcon);

//DOCS
export const GAddFileIcon = createIconComponent(addFileIcon);
export const GAddFolderIcon = createIconComponent(addFolderIcon);
export const GBooksIcon = createIconComponent(booksIcon);
export const GSaleReportIcon = createIconComponent(saleReportIcon);

//INVENTORY
export const GBottlesIcon = createIconComponent(bottlesIcon);
export const GMaterialsIcon = createIconComponent(materialsIcon);
export const GInIcon = createIconComponent(inIcon);
export const GIn2Icon = createIconComponent(in2Icon);
export const GOutIcon = createIconComponent(outIcon);
export const GOut2Icon = createIconComponent(out2Icon);
export const GShelveIcon = createIconComponent(shelveIcon);

// MAIN
export const GAdministrationIcon = createIconComponent(administrationIcon);
export const GAdministratorIcon = createIconComponent(administratorIcon);
export const GCashierThreeIcon = createIconComponent(cashierThreeIcon);
export const GCashierTwoIcon = createIconComponent(cashierTwoIcon);
export const GCashierIcon = createIconComponent(cashierIcon);
export const GContractIcon = createIconComponent(contractIcon);
export const GDispatchIcon = createIconComponent(dispatchIcon);
export const GExpensesIcon = createIconComponent(expensesIcon);
export const GGeneralReportsIcon = createIconComponent(generalReportsIcon);
export const GInventoryIcon = createIconComponent(inventoryIcon);
export const GInventoryTwoIcon = createIconComponent(inventoryTwoIcon);
export const GKardexIcon = createIconComponent(kardexIcon);
export const GOrdersIcon = createIconComponent(ordersIcon);
export const GPendingAccountsIcon = createIconComponent(pendingAccountsIcon);
export const GPendingPurchasesIcon = createIconComponent(pendingPurchasesIcon);
export const GPendingSalesIcon = createIconComponent(pendingSalesIcon);
export const GPetrol1Icon = createIconComponent(petrol1Icon);
export const GPetrol2Icon = createIconComponent(petrol2Icon);
export const GPetrol3Icon = createIconComponent(petrol3Icon);
export const GPolicyIcon = createIconComponent(policyIcon);
export const GPrinterIcon = createIconComponent(printerIcon);
export const GProductionIcon = createIconComponent(productionIcon);
export const GPurchasesIcon = createIconComponent(purchasesIcon);
export const GReportsIcon = createIconComponent(reportsIcon);
export const GRequisitionIcon = createIconComponent(requisitionsIcon);
export const GShippingIcon = createIconComponent(shippingIcon);
export const GTruckIcon = createIconComponent(truckIcon);

// GENERAL
export const GAddIcon = createIconComponent(addIcon);
export const GAdd1Icon = createIconComponent(add1Icon);
export const GEditIcon = createIconComponent(editIcon);
export const GEditUserIcon = createIconComponent(editUserIcon);
export const GGoBackIcon = createIconComponent(goBackIcon);
export const GLogoutIcon = createIconComponent(logoutIcon);
export const GRefreshIcon = createIconComponent(refreshIcon);
export const GAddUserIcon = createIconComponent(addUserIcon);
export const GSearchForIcon = createIconComponent(searchForIcon);

// ICONS
export const GAddProductIcon = createIconComponent(addProductIcon);
export const GSupplier2Icon = createIconComponent(supplier2Icon);
export const GCashPaymentIcon = createIconComponent(cashPaymentIcon);
export const GCreditPaymentIcon = createIconComponent(creditPaymentIcon);
export const GTicketIcon = createIconComponent(ticketIcon);
export const GInvoice2Icon = createIconComponent(invoice2Icon);
export const GInvoiceTax2Icon = createIconComponent(invoiceTax2Icon);
export const GCreditNoteIcon = createIconComponent(creditNoteIcon);
export const GDebitNoteIcon = createIconComponent(debitNoteIcon);
export const GProductsIcon = createIconComponent(productsIcon);
export const GClearIcon = createIconComponent(clearIcon);
export const GCashMethodIcon = createIconComponent(cashMethodIcon);
export const GCardMethodIcon = createIconComponent(cardMethodIcon);
export const GPaymentCheckMethodIcon = createIconComponent(paymentCheckMethodIcon);
export const GTransferMethodIcon = createIconComponent(transferMethodIcon);
export const GRestoreIcon = createIconComponent(restoreIcon);
export const GPersonIcon = createIconComponent(personIcon);
export const GPerson1Icon = createIconComponent(person1Icon);
export const GPerson2Icon = createIconComponent(person2Icon);

// MENU
export const GMenuAddDocumentIcon = createIconComponent(menuAddDocument);
export const GMenuBinderIcon = createIconComponent(menuBinderIcon);
export const GMenuBinder2Icon = createIconComponent(menuBinder2Icon);
export const GMenuBinder3Icon = createIconComponent(menuBinder3Icon);
export const GMenuBinder4Icon = createIconComponent(menuBinder4Icon);
export const GMenuBinder5Icon = createIconComponent(menuBinder5Icon);
export const GMenuBrandsIcon = createIconComponent(menuBrandsIcon);
export const GMenuCategoriesIcon = createIconComponent(menuCategoriesIcon);
export const GMenuCustomersIcon = createIconComponent(menuCustomersIcon);
export const GMenuCheckoutIcon = createIconComponent(menuCheckoutIcon);
export const GMenuDueAccountIcon = createIconComponent(menuDueAccountIcon);
export const GMenuDueAccountIcon1 = createIconComponent(menuDueAccountIcon1);
export const GMenuEmployeesIcon1 = createIconComponent(menuEmployeesIcon);
export const GMenuExpensesIcon = createIconComponent(menuExpensesIcon);
export const GMenuHomeIcon = createIconComponent(menuHomeIcon);
export const GMenuPurchasesIcon = createIconComponent(menuPurchasesIcon);
export const GMenuSettingsIcon = createIconComponent(menuSettingsIcon);
export const GMenuSummaryIcon = createIconComponent(menuSummaryIcon);
