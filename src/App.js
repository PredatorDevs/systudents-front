import './App.css';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate } from "react-router-dom";

import { ProtectedRoute } from './utils/ProtectedRoute';
import { getUserIsLoggedIn } from './utils/LocalData';
import { customNot } from './utils/Notifications';

import { checkToken } from './services/AuthServices';

import ComponentToPrint from './components/tickets/ComponentToPrint';
import Customers from './pages/Customers';
import Login from './pages/Login';
import MainLayout from './MainLayout';
import Page403 from './pages/Page403';
import Page404 from './pages/Page404';
import TokenExpired from './pages/TokenExpired';
import NewSale from './pages/sales/NewSale';
import Sales from './pages/Sales';
import Products from './pages/inventory/Products';
import Users from './pages/Users';
import Suppliers from './pages/Suppliers';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Ubications from './pages/Ubications';
import DeliveryRoutes from './pages/DeliveryRoutes';
import NewProductPurchase from './pages/purchases/NewProductPurchase';
import ProductPurchases from './pages/ProductPurchases';
import Cashiers from './pages/Cashiers';
import MyCashier from './pages/MyCashier';
import PageUnderConstruction from './pages/PageUnderConstruction';
import ParkingCheckouts from './pages/ParkingCheckouts';
import ParkingGuards from './pages/ParkingGuards';
import ParkingExpenses from './pages/ParkingExpenses';
import ParkingReports from './pages/ParkingReports';
import PendingSales from './pages/pendingaccounts/PendingSales';
import PendingPurchases from './pages/pendingaccounts/PendingPurchases';
import Expenses from './pages/Expenses';
import NewExpense from './pages/expenses/NewExpense';
import ContractDashboard from './pages/contracts/ContractDashboard';
import NewContract from './pages/contracts/NewContract';
import Furnishings from './pages/inventory/Furnishings';
import Settlements from './pages/reports/Settlements';
import Transfers from './pages/Transfers';
import NewTransfer from './pages/transfers/NewTransfer';
import RejectedTransfers from './pages/transfers/RejectedTransfers';
import SaleBooks from './pages/reports/SaleBooks';
import PurchaseBooks from './pages/reports/PurchaseBooks';
import OrderSales from './pages/OrderSales';
import NewOrderSale from './pages/ordersales/NewOrderSale';
import DashboardPage from './pages/DashboardPage';
import CustomerProfile from './pages/CustomerProfile';
import Kardex from './pages/Kardex';
import UserActionLogs from './pages/UserActionLogs';
import ProductAdjustments from './pages/inventory/ProductAdjustments';
import NewProductAdjustment from './pages/inventory/NewProductAdjustment';
import IssuedSales from './pages/reports/IssuedSales';
import ProfitReport from './pages/reports/ProfitReport';
import ProductsDeactivated from './pages/inventory/ProductsDeactivated';
import Policies from './pages/Policies';
import Production from './pages/Production';
import NewPolicy from './pages/policies/NewPolicy';
import NewProductionSheet from './pages/production/NewProductionSheet';
import ProductionRecords from './pages/production/ProductionRecords';
import RawMaterials from './pages/inventory/RawMaterials';
import { Result, Spin } from 'antd';
import NewRawMaterialPurchase from './pages/purchases/NewRawMaterialPurchase';
import RawMaterialPurchases from './pages/RawMaterialPurchases';
import IssuedPurchases from './pages/reports/IssuedPurchases';
import Main from './pages/Main';

const App = () => {
  const isLoggedIn = getUserIsLoggedIn();

  const navigate = useNavigate();
  const token = localStorage.getItem('userToken');

  const [checkingTokenIsLoading, setCheckingTokenIsLoading] = useState(false);

  useEffect(async () => {
    if (token === null) {
      navigate('/')
    } else {
      setCheckingTokenIsLoading(true);
      try {
        await checkToken();
        // customNot('success', 'Sesión válida', 'Sus credenciales aún no expiran');
      } catch(error) {
        customNot('warning', 'Sesión expirada', 'Sus credenciales han expirado');
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
        localStorage.removeItem('mhToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('permissionsData');
        axios.defaults.headers.common.authorization = '';
        axios.defaults.headers.common.mhauth = '';
        axios.defaults.headers.common.idtoauth = '';
        navigate('/tokenexpired');
      }
      setCheckingTokenIsLoading(false);
    }
  }, []);

  function renderProtectedRoute(
    routePath = '', 
    allowedRoles = [], 
    childComponent = (<div></div>)
  ) {
    return (
      <Route 
        path={routePath}
        element={
          <ProtectedRoute user={isLoggedIn} roles={allowedRoles}>
            {childComponent}
          </ProtectedRoute>
        }
      />
    )
  }

  // 1	Superadmin
  // 2	Administrador
  // 3	Gerente
  // 4	Facturador
  // 5	Proveedor
  // 6	Jefe de Inventarios
  // 7	Vendedor
  // 8	Consulta


  return checkingTokenIsLoading ? (
    <>
      <Result
        icon={<Spin size='large' />}
        title="Verificando su sesión actual"
        subTitle="Esto puede tomar un par de segundos..."
      />
    </>
  ) : (
    <Routes>
      <Route path="/" element={<Login />}></Route>
      <Route path="/print" element={<ComponentToPrint />}></Route>
      <Route
        path="/main/*"
        element={
          <ProtectedRoute user={isLoggedIn} roles={[1, 2, 3, 4, 5, 6, 7, 8]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {renderProtectedRoute('', [1, 2, 4, 5, 6, 7, 8], <Main />)}

        {renderProtectedRoute('contracts', [1, 2, 3, 4, 5, 6, 7, 8], <>Contratos</>)}

        {renderProtectedRoute('ordersales', [1, 2, 3, 4, 5, 6, 7, 8], <>Ordenes de Venta</>)}
        {renderProtectedRoute('ordersales/new', [1, 2, 4, 6], <NewOrderSale />)}
        {renderProtectedRoute('ordersales/summary', [1, 2, 4, 6], <OrderSales />)}

        {renderProtectedRoute('sales', [1, 2, 4, 6, 7], <>Ventas</>)}
        {renderProtectedRoute('sales/new', [1, 2, 4, 6, 7], <NewSale />)}
        {renderProtectedRoute('sales/summary', [1, 2, 4, 6, 7], <Sales />)}

        {renderProtectedRoute('purchases/products/new', [1, 2, 6], <NewProductPurchase />)}
        {renderProtectedRoute('purchases/products/summary', [1, 2, 6], <ProductPurchases />)}
        {renderProtectedRoute('purchases/rawmaterials/new', [1, 2, 6], <NewRawMaterialPurchase />)}
        {renderProtectedRoute('purchases/rawmaterials/summary', [1, 2, 6], <RawMaterialPurchases />)}

        {renderProtectedRoute('expenses/new', [1, 2], <NewExpense />)}
        {renderProtectedRoute('expenses/summary', [1, 2], <Expenses />)}

        {renderProtectedRoute('pending-accounts/to-collect', [1, 2, 4, 6], <PendingSales />)}
        {renderProtectedRoute('pending-accounts/to-pay', [1, 2, 6], <PendingPurchases />)}

        {renderProtectedRoute('inventory/products', [1, 2, 6, 7], <Products />)}
        {renderProtectedRoute('inventory/products/kardex', [1, 2, 6, 7], <Kardex />)}
        {renderProtectedRoute('inventory/products/adjustments', [1, 2, 6], <ProductAdjustments />)}
        {renderProtectedRoute('inventory/products/adjustments/new', [1, 2, 6], <NewProductAdjustment />)}
        {renderProtectedRoute('inventory/furnishings', [1, 2], <Furnishings />)}
        {renderProtectedRoute('inventory/products/deactivated', [1, 2, 6], <ProductsDeactivated />)}

        {renderProtectedRoute('inventory/rawmaterials', [1, 2, 6, 7], <RawMaterials />)}

        {renderProtectedRoute('my-cashier', [1, 2, 4, 6, 7], <MyCashier />)}

        {renderProtectedRoute('reports', [1, 2], <PageUnderConstruction />)}
        {renderProtectedRoute('reports/dashboard', [1, 2], <DashboardPage />)}
        {renderProtectedRoute('reports/shiftcuts', [1, 2], <Settlements />)}
        {renderProtectedRoute('reports/sales', [1, 2], <SaleBooks />)}
        {renderProtectedRoute('reports/purchases', [1, 2], <PurchaseBooks />)}
        {renderProtectedRoute('reports/issued-sales', [1, 2], <IssuedSales />)}
        {renderProtectedRoute('reports/issued-purchases', [1, 2], <IssuedPurchases />)}
        {renderProtectedRoute('reports/profit-report', [1, 2], <ProfitReport />)}

        {renderProtectedRoute('administration/cashiers', [1, 2], <Cashiers />)}
        {renderProtectedRoute('administration/customers', [1, 2, 4, 6, 7], <Customers />)}
        {renderProtectedRoute('administration/customers/profile', [1, 2], <CustomerProfile />)}
        {renderProtectedRoute('administration/users', [1, 2], <Users />)}
        {renderProtectedRoute('administration/users/logs', [1, 2], <UserActionLogs />)}
        {renderProtectedRoute('administration/suppliers', [1, 2], <Suppliers />)}
        {renderProtectedRoute('administration/categories', [1, 2], <Categories />)}
        {renderProtectedRoute('administration/brands', [1, 2], <Brands />)}
        {renderProtectedRoute('administration/ubications', [1, 2], <Ubications />)}
        {renderProtectedRoute('administration/delivery-routes', [1, 2], <DeliveryRoutes />)}

        {renderProtectedRoute('parking-checkouts/incomes', [1, 2], <ParkingCheckouts />)}
        {renderProtectedRoute('parking-checkouts/expenses', [1, 2], <ParkingExpenses />)}
        {renderProtectedRoute('parking-checkouts/guards', [1, 2], <ParkingGuards />)}
        {renderProtectedRoute('parking-checkouts/reports', [1, 2], <ParkingReports />)}

        {renderProtectedRoute('transfers', [1, 2], <Transfers />)}
        {renderProtectedRoute('transfers/new', [1, 2], <NewTransfer />)}
        {renderProtectedRoute('transfers/rejecteds', [1, 2], <RejectedTransfers />)}

        {renderProtectedRoute('contracts', [1, 2], <ContractDashboard />)}
        {renderProtectedRoute('contracts/new', [1, 2], <NewContract />)}

        {renderProtectedRoute('policies', [1, 2], <Policies />)}
        {renderProtectedRoute('policies/new', [1, 2], <NewPolicy />)}
        {renderProtectedRoute('production', [1, 2], <Production />)}
        {renderProtectedRoute('production/new', [1, 2], <NewProductionSheet />)}
        {renderProtectedRoute('production/records', [1, 2], <ProductionRecords />)}
        <Route path='*' element={<Page404 />} />
      </Route>
      <Route path="/noauth" element={<Page403 />}></Route>
      <Route path="/tokenexpired" element={<TokenExpired />}></Route>
      <Route path='*' element={<Page404 />} />
    </Routes>
  );
};
export default App;
