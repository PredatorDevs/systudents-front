import './MainLayout.css';
import {
  AppstoreOutlined,
  BlockOutlined,
  BookOutlined,
  BookTwoTone,
  CarOutlined,
  ClockCircleTwoTone,
  ContainerOutlined,
  DashboardOutlined,
  DownloadOutlined,
  FieldTimeOutlined,
  FileOutlined,
  FileSearchOutlined,
  HomeOutlined,
  HomeTwoTone,
  LogoutOutlined,
  MoneyCollectOutlined,
  PartitionOutlined,
  PlusOutlined,
  PushpinOutlined,
  ReadOutlined,
  RiseOutlined,
  ScheduleOutlined,
  SecurityScanTwoTone,
  SettingOutlined,
  SettingTwoTone,
  ShoppingCartOutlined,
  StockOutlined,
  UserOutlined,
  WarningTwoTone,
} from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Col, Dropdown, Layout, Menu, Modal, Row, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useIdleTimer } from 'react-idle-timer';
import axios from 'axios';
import { getUserIsAdmin, getUserLocationAddress, getUserLocationName, getUserName, getUserRole } from './utils/LocalData';
import { v4 as uuidv4 } from 'uuid';

import menuLogo from './img/logos/logo.png';
import { includes } from 'lodash';
import { authMH } from './services/AuthServices';
import { customNot } from './utils/Notifications';
import { millisecondsToHours } from './utils/DateTimeUtils';
import {
  GBottlesIcon,
  GCashierIcon,
  GInventoryIcon,
  GInventoryTwoIcon,
  GMaterialsIcon,
  GMenuAddDocumentIcon,
  GMenuAddIcon,
  GMenuBinder2Icon,
  GMenuBinderIcon,
  GMenuBrandsIcon,
  GMenuCategoriesIcon,
  GMenuCheckoutIcon,
  GMenuCustomersIcon,
  GMenuDueAccountIcon,
  GMenuExpensesIcon,
  GMenuHomeIcon,
  GMenuSettingsIcon,
  GMenuSummaryIcon,
  GPurchasesIcon,
  GReportsIcon,
  GShelveIcon
} from './utils/IconImageProvider';

const { Header, Content, Footer, Sider } = Layout;

const { confirm } = Modal;

const MainLayout = () => {
  const { pathname } = useLocation();

  const [fetching, setFetching] = useState(false);

  const [openIdleTimer, setOpenIdleTimer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState(getCurrentSelectedMenuKeyByRoute(pathname));
  const [openedMenuKey, setOpenedMenuKey] = useState(getCurrentOpenKeysByRoute(pathname));
  // const [activityStatus, setActivityStatus] = useState('Active');
  const [count, setCount] = useState(0);
  const [remaining, setRemaining] = useState(0);
  
  const navigate = useNavigate();

  const roleId = getUserRole();
  
  const onIdle = () => {
    // setActivityStatus('Idle');
    setOpenIdleTimer(false);
    forceLogoutAction();
  }

  const onPrompt = () => {
    // setActivityStatus('Prompted')
    setOpenIdleTimer(true);
  }

  const onActive = () => {
    // setActivityStatus('Active')
  }

  const onMessage = () => {
    setCount(count + 1)
  }

  const {
    getRemainingTime,
    getTabId,
    isLeader,
    isLastActiveTab,
    activate,
    reset,
    pause,
    message
  } = useIdleTimer({
    onIdle,
    onActive,
    onMessage,
    onPrompt,
    stopOnIdle: true,
    timeout: 10800000,
    promptBeforeIdle: 300000,
    crossTab: true,
    leaderElection: true,
    syncTimers: 200
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000))
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    setSelectedMenuKey(pathname);
    setOpenedMenuKey(getCurrentOpenKeysByRoute(pathname));
 }, [ pathname ]);

  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
      title: 'Hola'
    };
  }

  function generateBreadcrumbs(items) {
    return (
      <>
        {
          (items || []).map((x, index) => <Breadcrumb.Item key={uuidv4()}>{x}</Breadcrumb.Item>)
        }
      </>
    )
  }

  function getCurrentBreadcumbByRoute(pathName) {
    switch(pathName) {
      case "/main": return generateBreadcrumbs(['Principal']);
      case "/main/contracts": return generateBreadcrumbs(['Principal', 'Contratos']);
      case "/main/sales": return generateBreadcrumbs(['Principal', 'Facturacion']);
      case "/main/sales/new": return generateBreadcrumbs(['Principal', 'Facturacion', 'Nueva Factura']);
      case "/main/sales/summary": return generateBreadcrumbs(['Principal', 'Facturacion', 'Resumen']);
      case "/main/purchases/rawmaterials/new": return generateBreadcrumbs(['Principal', 'Compras', 'Materias Primas', 'Nueva Compra']);
      case "/main/purchases/rawmaterials/summary": return generateBreadcrumbs(['Principal', 'Compras', 'Materias Primas', 'Resumen']);
      case "/main/purchases/products/new": return generateBreadcrumbs(['Principal', 'Compras', 'Productos', 'Nueva Compra']);
      case "/main/purchases/products/summary": return generateBreadcrumbs(['Principal', 'Compras', 'Productos', 'Resumen']);
      case "/main/expenses/new": return generateBreadcrumbs(['Principal', 'Gastos', 'Nuevo Gasto']);
      case "/main/expenses/summary": return generateBreadcrumbs(['Principal', 'Gastos', 'Resumen']);
      case "/main/productions/new": return generateBreadcrumbs(['Principal', 'Producciones', 'Nueva Hoja Produccion']);
      case "/main/productions/summary": return generateBreadcrumbs(['Principal', 'Producciones', 'Resumen']);
      case "/main/pending-accounts/to-collect": return generateBreadcrumbs(['Principal', 'Cuentas Pendientes', 'Por Cobrar']);
      case "/main/pending-accounts/to-pay": return generateBreadcrumbs(['Principal', 'Cuentas Pendientes', 'Por pagar']);
      case "/main/inventory/rawmaterialss": return generateBreadcrumbs(['Principal', 'Inventario', 'Materias Primas']);
      case "/main/inventory/products": return generateBreadcrumbs(['Principal', 'Inventario', 'Productos']);
      case "/main/inventory/products/kardex": return generateBreadcrumbs(['Principal', 'Inventario', 'Productos', 'Kardex']);
      case "/main/inventory/products/deactivated": return generateBreadcrumbs(['Principal', 'Inventario', 'Productos', 'Deshabilitados']);
      case "/main/inventory/products/adjustments": return generateBreadcrumbs(['Principal', 'Inventario', 'Productos', 'Ajustes de Existencias']);
      case "/main/inventory/products/adjustments/new": return generateBreadcrumbs(['Principal', 'Inventario', 'Productos', 'Ajustes de Existencias', 'Nuevo']);
      case "/main/inventory/rawmaterials": return generateBreadcrumbs(['Principal', 'Inventario', 'Materias Primas']);
      case "/main/my-cashier": return generateBreadcrumbs(['Principal', 'Mi Caja']);
      case "/main/reports": return generateBreadcrumbs(['Principal', 'Reportes']);
      case "/main/reports/dashboard": return generateBreadcrumbs(['Principal', 'Reportes', 'Dashboard']);
      case "/main/reports/sales": return generateBreadcrumbs(['Principal', 'Reportes', 'Libro Ventas']);
      case "/main/reports/purchases": return generateBreadcrumbs(['Principal', 'Reportes', 'Libro Compras']);
      case "/main/reports/issued-sales": return generateBreadcrumbs(['Principal', 'Reportes', 'Ventas Emitidas']);
      case "/main/reports/issued-purchases": return generateBreadcrumbs(['Principal', 'Reportes', 'Compras Registradas']);
      case "/main/reports/profit-report": return generateBreadcrumbs(['Principal', 'Reportes', 'Reporte de Utilidades']);
      case "/main/reports/shiftcuts": return generateBreadcrumbs(['Principal', 'Reportes', 'Cortes de caja']);
      case "/main/administration/cashiers": return generateBreadcrumbs(['Principal', 'Administracion', 'Cajas']);
      case "/main/administration/customers": return generateBreadcrumbs(['Principal', 'Administracion', 'Clientes']);
      case "/main/administration/customers/profile": return generateBreadcrumbs(['Principal', 'Administracion', 'Clientes', 'Perfil']);
      case "/main/administration/users": return generateBreadcrumbs(['Principal', 'Administracion', 'Usuarios']);
      case "/main/administration/users/logs": return generateBreadcrumbs(['Principal', 'Administracion', 'Usuarios', 'Actividad']);
      case "/main/administration/suppliers": return generateBreadcrumbs(['Principal', 'Administracion', 'Proveedores']);
      case "/main/administration/categories": return generateBreadcrumbs(['Principal', 'Administracion', 'Categorías']);
      case "/main/administration/brands": return generateBreadcrumbs(['Principal', 'Administracion', 'Marcas']);
      case "/main/administration/ubications": return generateBreadcrumbs(['Principal', 'Administracion', 'Ubicaciones']);
      case "/main/administration/delivery-routes": return generateBreadcrumbs(['Principal', 'Administracion', 'Rutas']);
      case "/main/administration/general-data": return generateBreadcrumbs(['Principal', 'Administracion', 'Datos Generales']);
      case "/main/parking-checkouts/incomes": return generateBreadcrumbs(['Principal', 'Control de Parqueos', 'Ingresos']);
      case "/main/parking-checkouts/expenses": return generateBreadcrumbs(['Principal', 'Control de Parqueos', 'Gastos']);
      case "/main/parking-checkouts/guards": return generateBreadcrumbs(['Principal', 'Control de Parqueos', 'Vigilantes']);
      case "/main/parking-checkouts/reports": return generateBreadcrumbs(['Principal', 'Control de Parqueos', 'Informes']);
      case "/main/transfers": return generateBreadcrumbs(['Principal', 'Traslados']);
      case "/main/transfers/new": return generateBreadcrumbs(['Principal', 'Traslados', 'Nuevo']);
      case "/main/transfers/rejecteds": return generateBreadcrumbs(['Principal', 'Traslados', 'Rechazados']);
      case "/main/ordersales/new": return generateBreadcrumbs(['Principal', 'Ordenes de Venta', 'Nueva']);
      case "/main/ordersales/summary": return generateBreadcrumbs(['Principal', 'Ordenes de Venta', 'Resumen']);
      default: return (<></>);
    }
  }

  function getCurrentOpenKeysByRoute(pathName) {
    switch(pathName) {
      case "/main": return [];
      case "/main/sales/new": return ["sub1"];
      case "/main/sales/summary": return ["sub1"];
      case "/main/purchases/rawmaterials/new": return ["sub2", "sub3"];
      case "/main/purchases/rawmaterials/summary": return ["sub2", "sub3"];
      case "/main/purchases/products/new": return ["sub2", "sub4"];
      case "/main/purchases/products/summary": return ["sub2", "sub4"];
      case "/main/expenses/new": return ["sub10"];
      case "/main/expenses/summary": return ["sub10"];
      case "/main/productions/new": return ["sub5"];
      case "/main/productions/summary": return ["sub5"];
      case "/main/pending-accounts/to-collect": return ["sub6"];
      case "/main/pending-accounts/to-pay": return ["sub6"];
      case "/main/inventory/rawmaterials": return ["sub7"];
      case "/main/inventory/products": return ["sub7"];
      case "/main/inventory/products/kardex": return ["sub7"];
      case "/main/inventory/products/adjustments": return ["sub7"];
      case "/main/inventory/products/adjustments/new": return ["sub7"];
      case "/main/inventory/products/deactivated": return ["sub7"];
      case "/main/my-cashier": return [];
      case "/main/reports": return [];
      case "/main/administration/cashiers": return ["sub8"];
      case "/main/administration/customers": return ["sub8"];
      case "/main/administration/customers/profile": return ["sub8"];
      case "/main/administration/users": return ["sub8"];
      case "/main/administration/users/logs": return ["sub8"];
      case "/main/administration/suppliers": return ["sub8"];
      case "/main/administration/categories": return ["sub8"];
      case "/main/administration/brands": return ["sub8"];
      case "/main/administration/ubications": return ["sub8"];
      case "/main/administration/delivery-routes": return ["sub8"];
      case "/main/administration/general-data": return ["sub8"];
      case "/main/parking-checkouts/incomes": return ["sub9"];
      case "/main/parking-checkouts/expenses": return ["sub9"];
      case "/main/parking-checkouts/guards": return ["sub9"];
      case "/main/parking-checkouts/reports": return ["sub9"];
      case "/main/reports/shiftcuts": return ["sub11"];
      case "/main/reports/dashboard": return ["sub11"];
      case "/main/reports/sales": return ["sub11"];
      case "/main/reports/purchases": return ["sub11"];
      case "/main/reports/issued-sales": return ["sub11"];
      case "/main/reports/issued-purchases": return ["sub11"];
      case "/main/reports/profit-report": return ["sub11"];
      case "/main/transfers": return [];
      case "/main/transfers/new": return [];
      case "/main/transfers/rejecteds": return [];
      case "/main/ordersales/new": return [];
      case "/main/ordersales/summary": return ["sub12"];
      case "/main/contracts": return [];
      case "/main/contracts/new": return [];
      case "/main/inventory/furnishings": return ["sub7"];
      default: return [];
    }
  }

  function getCurrentSelectedMenuKeyByRoute(pathName) {
    switch(pathName) {
      case "/main": return "1";
      case "/main/sales/new": return "2";
      case "/main/sales/summary": return "3";
      case "/main/purchases/rawmaterials/new": return "4";
      case "/main/purchases/rawmaterials/summary": return "5";
      case "/main/purchases/products/new": return "6";
      case "/main/purchases/products/summary": return "7";
      case "/main/expenses/new": return "29";
      case "/main/expenses/summary": return "30";
      case "/main/productions/new": return "8";
      case "/main/productions/summary": return "9";
      case "/main/pending-accounts/to-collect": return "10";
      case "/main/pending-accounts/to-pay": return "11";
      case "/main/inventory/rawmaterials": return "12";
      case "/main/inventory/products": return "13";
      case "/main/inventory/products/kardex": return "13";
      case "/main/inventory/products/adjustments": return "13";
      case "/main/inventory/products/adjustments/new": return "13";
      case "/main/inventory/products/deactivated": return "13";
      case "/main/my-cashier": return "14";
      case "/main/reports": return "15";
      case "/main/administration/cashiers": return "16";
      case "/main/administration/customers": return "17";
      case "/main/administration/customers/profile": return "17";
      case "/main/administration/users": return "18";
      case "/main/administration/users/logs": return "18";
      case "/main/administration/suppliers": return "19";
      case "/main/administration/categories": return "20";
      case "/main/administration/brands": return "21";
      case "/main/administration/ubications": return "22";
      case "/main/administration/delivery-routes": return "23";
      case "/main/administration/general-data": return "24";
      case "/main/parking-checkouts/incomes": return "25";
      case "/main/parking-checkouts/expenses": return "26";
      case "/main/parking-checkouts/guards": return "27";
      case "/main/parking-checkouts/reports": return "28";
      case "/main/reports/shiftcuts": return "31";
      case "/main/transfers": return "32";
      case "/main/transfers/new": return "32";
      case "/main/transfers/rejecteds": return "32";
      case "/main/reports/dashboard": return "33";
      case "/main/reports/sales": return "34";
      case "/main/reports/purchases": return "35";
      case "/main/reports/issued-sales": return "38";
      case "/main/reports/issued-purchases": return "43";
      case "/main/reports/profit-sales": return "39";
      case "/main/ordersales/new": return "36";
      case "/main/ordersales/summary": return "37";
      case "/main/contracts": return "40";
      case "/main/contracts/new": return "41";
      case "/main/inventory/furnishings": return "42";
      default: return "1";
    }
  }

  // 1	Superadmin
  // 2	Administrador
  // 3	Gerente
  // 4	Facturador
  // 5	Proveedor
  // 6	Jefe de Inventarios
  // 7	Vendedor
  // 8	Consulta
  // LAST KEY: 43
  // LAST SUB: sub12
  const items = [
    getItem('Principal', '1', <GMenuHomeIcon width={'18px'} addBackground={true} bgMargin={8} />),
    // getUserIsAdmin() ? getItem('Ctrl. Parqueos', 'sub9', <CarOutlined />, [
    //   getItem('Ingresos', '25', <DownloadOutlined />),
    //   getItem('Gastos', '26', <UploadOutlined />),
    //   getItem('Vigilantes', '27', <UserOutlined />),
    //   getItem('Informes', '28', <BarChartOutlined />)
    // ]) : null,
    // includes([1, 2, 4, 6], roleId) ? getItem('Ord. de Venta', 'sub12', <ScheduleOutlined />, [
    //   getItem('Nueva', '36', <PlusOutlined />),
    //   getItem('Resumen', '37', <BookOutlined />)
    // ]) : null,
    // includes([1, 2, 4, 6], roleId) ? getItem('Contratos', '40', <FolderOpenOutlined />) : null,
    includes([1, 2, 4, 6, 7], roleId) ? getItem('Facturacion', 'sub1', <GMenuCheckoutIcon width={'18px'} addBackground={true} bgMargin={8} />, [
      getItem('Nueva', '2', <GMenuAddDocumentIcon width={'18px'} addBackground={true} bgMargin={8} />),
      getItem('Resumen', '3', <GMenuSummaryIcon width={'18px'} addBackground={true} bgMargin={8} />)
    ]) : null,
    includes([1, 2, 6], roleId) ? getItem(
      'Compras',
      'sub2',
      <GPurchasesIcon width={'18px'} addBackground={true} bgMargin={8} />,
      // <GMenuPurchasesIcon width='20px' addBackground backgroundMargin={5} backgroundPadding={0} />,
    [
      includes([1, 2, 6], roleId) ? getItem('Producto', 'sub4', <GBottlesIcon width={'18px'} addBackground={true} bgMargin={8} />, [
        includes([1, 2, 6], roleId) ? getItem('Nueva', '6', <GMenuAddDocumentIcon width={'18px'} addBackground={true} bgMargin={8} />) : null,
        includes([1, 2, 6], roleId) ? getItem('Resumen', '7', <GMenuSummaryIcon width={'18px'} addBackground={true} bgMargin={8} />) : null
      ]) : null,
      includes([1, 2, 6], roleId) ? getItem('Mat. Prima', 'sub3', <GMaterialsIcon width={'18px'} addBackground={true} bgMargin={8} />, [
        includes([1, 2, 6], roleId) ? getItem('Nueva', '4', <GMenuAddDocumentIcon width={'18px'} addBackground={true} bgMargin={8} />) : null,
        includes([1, 2, 6], roleId) ? getItem('Resumen', '5', <GMenuSummaryIcon width={'18px'} addBackground={true} bgMargin={8} />) : null
      ]) : null,
    ]) : null,
    includes([1, 2], roleId) ? getItem(
      'Gastos',
      'sub10',
      <GMenuExpensesIcon width={'18px'} addBackground={true} bgMargin={8} />,
      // <GMenuExpensesIcon width='20px' addBackground backgroundMargin={5} backgroundPadding={0} />,
    [
      getItem('Nuevo', '29', <GMenuAddDocumentIcon width={'18px'} addBackground={true} bgMargin={8} />),
      getItem('Resumen', '30', <GMenuSummaryIcon width={'18px'} addBackground={true} bgMargin={8} />)
    ]) : null,
    // getItem('Producción', 'sub5', <ShoppingCartOutlined />, [
    //   getItem('Nueva hoja', '8', <PlusOutlined />),
    //   getItem('Resumen', '9', <BookOutlined />)
    // ]),
    includes([1, 2, 4, 6], roleId) ? getItem('Ctas. Pendientes', 'sub6', <GMenuDueAccountIcon width={'18px'} addBackground={true} bgMargin={8} />, [
      includes([1, 2, 4, 6], roleId) ? getItem('Por cobrar', '10', <BookTwoTone twoToneColor={'#2f54eb'} />) : null,
      includes([1, 2, 6], roleId) ? getItem('Por pagar', '11', <BookTwoTone twoToneColor={'#eb2f96'} />) : null
    ]) : null,
    includes([1, 2, 6, 7], roleId) ? getItem('Inventario', 'sub7', <GShelveIcon width={'18px'} addBackground={true} bgMargin={8} />, [
      includes([1, 2, 6, 7], roleId) ? getItem('Productos', '13', <GBottlesIcon width={'18px'} addBackground={true} bgMargin={8} />) : null,
      includes([1, 2, 6, 7], roleId) ? getItem('Mat. Prima', '12', <GMaterialsIcon width={'18px'} addBackground={true} bgMargin={8} />) : null,
      // includes([1, 2, 6, 7], roleId) ? getItem('Mobiliario', '42', <ReconciliationOutlined />) : null
    ]) : null,
    includes([1, 2, 4, 6, 7], roleId) ? getItem('Mi Caja', '14', <GCashierIcon width={'18px'} addBackground={true} bgMargin={8} />) : null,
    // getUserIsAdmin() ? getItem('Reportes', '15', <FileOutlined />) : null,
    // includes([1, 2], roleId) ? getItem('Traslados', '32', <CarOutlined />) : null,
    includes([1, 2], roleId) ? getItem('Reportes', 'sub11', <GReportsIcon width={'18px'} addBackground={true} bgMargin={8} />, [
      getItem('Dashboard', '33', <DashboardOutlined />),
      getItem('Libro Ventas', '34', <GMenuBinderIcon width={'18px'} addBackground={true} bgMargin={8} />),
      getItem('Libro Compras', '35', <GMenuBinder2Icon width={'18px'} addBackground={true} bgMargin={8} />),
      getItem('Facturas Emitidas', '38', <FileSearchOutlined />),
      getItem('Compras Registradas', '43', <FileSearchOutlined />),
      getItem('Utilidades', '39', <RiseOutlined />),
      getItem('Cortes de caja', '31', <FieldTimeOutlined />)
    ]) : null,
    includes([1, 2, 4, 6, 7], roleId) ? getItem('Administración', 'sub8', <GMenuSettingsIcon width={'18px'} addBackground={true} bgMargin={8} />, [
      includes([1, 2], roleId) ? getItem('Cajas', '16', <ContainerOutlined />) : null,
      includes([1, 2, 4, 6, 7], roleId) ? getItem('Clientes', '17', <UserOutlined />) : null,
      includes([1, 2], roleId) ? getItem('Usuarios', '18', <UserOutlined />) : null,
      includes([1, 2], roleId) ? getItem('Proveedores', '19', <UserOutlined />) : null,
      includes([1, 2], roleId) ? getItem('Categorias', '20', <AppstoreOutlined />) : null,
      includes([1, 2], roleId) ? getItem('Marcas', '21', <BlockOutlined />) : null,
      includes([1, 2], roleId) ? getItem('Ubicaciones', '22', <PushpinOutlined />) : null,
      includes([1, 2], roleId) ? getItem('Rutas', '23', <PartitionOutlined />) : null,
      // getItem('Datos Generales', '24', <ReadOutlined />),
    ]) : null,
    getItem('', '100'),
  ];

  function forceLogoutAction() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('mhToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('permissionsData');
    axios.defaults.headers.common.authorization = '';
    axios.defaults.headers.common.mhauth = '';
    axios.defaults.headers.common.idtoauth = '';
    navigate('/', { state: { forcedLogout: true } });
  }

  function logoutAction() {
    confirm({
      title: '¿Desea salir?',
      icon: <LogoutOutlined />,
      content: 'Confirme cierre de sesión',
      okText: 'Salir',
      cancelText: 'Cancelar',
      onOk() {
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
        localStorage.removeItem('mhToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('permissionsData');
        axios.defaults.headers.common.authorization = '';
        axios.defaults.headers.common.mhauth = '';
        axios.defaults.headers.common.idtoauth = '';
        navigate('/', { state: { forcedLogout: false } });
      },
      onCancel() {},
    });
  }

  const tabId = getTabId() === null ? 'loading' : getTabId().toString()
  const lastActiveTab =
    isLastActiveTab() === null ? 'loading' : isLastActiveTab().toString()
  const leader = isLeader() === null ? 'loading' : isLeader().toString()

  return (   
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider
        className="site-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="logo" style={{ display: collapsed ? 'none' : 'flex' }}>
          {/* <Avatar
            size={64}
            shape="square"
            style={{ marginBottom: 5 }}
            src={menuLogo}
          /> */}
          <img
            width={75}
            height={75}
            src={menuLogo}
            style={{ objectFit: 'cover' }}
            alt={'cover'}
          />
          <p style={{ margin: 0, fontWeight: 600 }}>
            {getUserLocationName()}
          </p>
          <p style={{ margin: 0, fontSize: 12 }}>
            {getUserLocationAddress()}
          </p>
        </div>
        {/* <p style={{ color: 'white' }}>{tabId}</p>
        <p style={{ color: 'white' }}>{lastActiveTab}</p>
        <p style={{ color: 'white' }}>{leader}</p>
        <p style={{ color: 'white' }}>{getRemainingTime()}</p> */}
        {/* <div style={{ height: '350px', overflow: 'auto' }}> */}
          <Menu
            theme="dark"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={getCurrentOpenKeysByRoute(pathname)}
            mode="inline"
            items={items}
            openKeys={openedMenuKey}
            selectedKeys={[getCurrentSelectedMenuKeyByRoute(pathname)]}
            onOpenChange={(openKeys) => {
              setOpenedMenuKey(openKeys);
            }}
            onClick={(a) => {
              setSelectedMenuKey(a.key);
              switch(a.key) {
                case '1': navigate('/main'); break;
                case '2': navigate('/main/sales/new'); break;
                case '3': navigate('/main/sales/summary'); break;
                case '4': navigate('/main/purchases/rawmaterials/new'); break;
                case '5': navigate('/main/purchases/rawmaterials/summary'); break;
                case '6': navigate('/main/purchases/products/new'); break;
                case '7': navigate('/main/purchases/products/summary'); break;
                case '8': navigate('/main/productions/new'); break;
                case '9': navigate('/main/productions/summary'); break;
                case '10': navigate('/main/pending-accounts/to-collect'); break;
                case '11': navigate('/main/pending-accounts/to-pay'); break;
                case '12': navigate('/main/inventory/rawmaterials'); break;
                case '13': navigate('/main/inventory/products'); break;
                case '14': navigate('/main/my-cashier'); break;
                case '15': navigate('/main/reports'); break;
                case '16': navigate('/main/administration/cashiers'); break;
                case '17': navigate('/main/administration/customers'); break;
                case '18': navigate('/main/administration/users'); break;
                case '19': navigate('/main/administration/suppliers'); break;
                case '20': navigate('/main/administration/categories'); break;
                case '21': navigate('/main/administration/brands'); break;
                case '22': navigate('/main/administration/ubications'); break;
                case '23': navigate('/main/administration/delivery-routes'); break;
                case '24': navigate('/main/administration/general-data'); break;
                case '25': navigate('/main/parking-checkouts/incomes'); break;
                case '26': navigate('/main/parking-checkouts/expenses'); break;
                case '27': navigate('/main/parking-checkouts/guards'); break;
                case '28': navigate('/main/parking-checkouts/reports'); break;
                case '29': navigate('/main/expenses/new'); break;
                case '30': navigate('/main/expenses/summary'); break;
                case '31': navigate('/main/reports/shiftcuts'); break;
                case '32': navigate('/main/transfers'); break;
                case '33': navigate('/main/reports/dashboard'); break;
                case '34': navigate('/main/reports/sales'); break;
                case '35': navigate('/main/reports/purchases'); break;
                case '38': navigate('/main/reports/issued-sales'); break;
                case '43': navigate('/main/reports/issued-purchases'); break;
                case '39': navigate('/main/reports/profit-report'); break;
                case '36': navigate('/main/ordersales/new'); break;
                case '37': navigate('/main/ordersales/summary'); break;
                case '40': navigate('/main/contracts'); break;
                case '41': navigate('/main/contracts/new'); break;
                case '42': navigate('/main/inventory/furnishings'); break;
                default: navigate('/main'); break;
              }
              setSelectedMenuKey(a.key);
            }}
          />
        {/* </div> */}
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: '0px 15px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Space size={'small'}>
              <Avatar size={32} style={{ backgroundColor: '#2f54eb' }} icon={<UserOutlined />} />
              <p style={{ margin: 0 }}>{`${getUserName()}`}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'gray' }}>{`${getUserIsAdmin() ? 'Administrativo' : 'Operativo'}`}</p>
              {/* <div
                onClick={(e) => {
                  alert('Hellow');
                }}
              >
                <Badge count={5}>
                  <BellTwoTone style={{ fontSize: '20px' }} />
                </Badge>
              </div> */}
            </Space>
            <Space size={'small'}>
              {/* <Tag icon={<ClockCircleTwoTone />}>{`${millisecondsToHours(getRemainingTime())}`}</Tag> */}
              <Dropdown
                menu={{
                  items: [
                    {
                      label: 'Ajustes',
                      key: '1',
                      icon: <SettingTwoTone />,
                      onClick: (e) => {
                        e.domEvent.stopPropagation();
                      }
                    },
                    {
                      label: 'Reautenticar MH',
                      key: '10',
                      icon: <SecurityScanTwoTone />,
                      onClick: async (e) => {
                        e.domEvent.stopPropagation();
                        setFetching(true);
                        try {
                          const res = await authMH();
                          const data = res.data;
                          const { body } = data;
                          const { token } = body;
                          localStorage.setItem('mhToken', token);
                          axios.defaults.headers.common.mhauth = token;
                          customNot('success', 'Autenticación Servicios M. Hacienda', 'Se ha obtenido un nuevo token para esta sesión');
                        } catch(error) {
                          console.log(error);
                          customNot('success', 'Autenticación Servicios M. Hacienda', 'No se ha podido obtener un nuevo token para esta sesión');
                        }
                        setFetching(false);
                      }
                    },
                  ]
                }}
                placement="bottomRight"
              >
                <Button loading={fetching} icon={<SettingOutlined />} onClick={(e) => {e.stopPropagation()}} />
              </Dropdown>
              <Button loading={fetching} type={'primary'} danger icon={<LogoutOutlined />} onClick={() => logoutAction()}>Cerrar sesión</Button>
            </Space>
          </div>
        </Header>
        <Content
          className="site-layout-content"
          style={{
            margin: '0 16px'
          }}
        >
          <Breadcrumb
            style={{
              margin: '16px 0',
            }}
          >
            {getCurrentBreadcumbByRoute(pathname)}
          </Breadcrumb>
          <div
            className="site-layout-background"
            style={{
              padding: 24,
              minHeight: 360
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            height: 55
          }}
        >
          <p style={{ fontSize: 11, margin: 0, fontWeight: 600 }}>SigProCOM ©2024</p>
        </Footer>
      </Layout>
      <Modal
        centered
        width={350}
        closable={true}
        closeIcon={<></>}
        maskClosable={true}
        open={openIdleTimer}
        onOk={() => {
          setOpenIdleTimer(false);
          reset();
        }}
        okText={'Extender sesión'}
        onCancel={() => {
          setOpenIdleTimer(false);
          forceLogoutAction();
        }}
        cancelText={'Cerrar sesión'}
      >
        <Row gutter={8}>
          <Col span={3} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WarningTwoTone twoToneColor={'orange'} style={{ fontSize: '24px' }} />
          </Col>
          <Col span={21}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>Inactividad detectada</p>
          </Col>
          <Col span={3}>      
          </Col>
          <Col span={21}>      
            <p style={{ margin: 0, fontSize: 14, color: 'gray' }}>{remaining} segundos para cerrar su sesión</p>
          </Col>
        </Row>
      </Modal>
    </Layout>
  );
};

export default MainLayout;