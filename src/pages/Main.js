import { Col, Row, Card, Modal } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { Wrapper } from '../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';

import sigproLogo from '../img/logos/sigpro-logo.png';

import { LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import {
  GAdministrationIcon,
  GBottlesIcon,
  GCashierIcon,
  GCashierThreeIcon,
  GContractIcon,
  GCustomersIcon,
  GDispatchIcon,
  GExpensesIcon,
  GInventoryIcon,
  GKardexIcon,
  GLogoutIcon,
  GMaterialsIcon,
  GMenuBrandsIcon,
  GMenuCategoriesIcon,
  GMenuCheckoutIcon,
  GMenuCustomersIcon,
  GMenuDueAccountIcon,
  GMenuDueAccountIcon1,
  GMenuExpensesIcon,
  GOrdersIcon,
  GPendingSalesIcon,
  GPolicyIcon,
  GProductionIcon,
  GPurchasesIcon,
  GReportsIcon,
  GRequisitionIcon,
  GShelveIcon,
  GShippingIcon
} from '../utils/IconImageProvider';
import { DeveloperInformation } from '../styled-components/DeveloperInformation';
import { getUserLocation, getUserLocationAddress, getUserLocationName } from '../utils/LocalData';
import { MainMenuCard } from '../styled-components/MainMenuCard';
import { customNot } from '../utils/Notifications';

const { confirm } = Modal;

const Container = styled.div`
  /* align-items: center; */
  background-color: #221D47;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  box-shadow: 3px 3px 5px 0px #6B738F;
  -webkit-box-shadow: 3px 3px 5px 0px #6B738F;
  -moz-box-shadow: 3px 3px 5px 0px #6B738F;
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  .ant-card:hover {
    cursor: pointer;
  }
  .card-title {
    font-size: 15px;
    color: #223B66;
    text-overflow: ellipsis;
    /* background-color: red; */
    font-weight: 600;
    margin: 0px;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
  }
`;

function Main() {
  // const [count, setCount] = useState(0);
  const navigate = useNavigate();

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
        axios.defaults.headers.common.authorization = '';
        axios.defaults.headers.common.mhauth = '';
        axios.defaults.headers.common.idtoauth = '';
        navigate('/');
      },
      onCancel() {},
    });
  }

  return (
    <Wrapper>
      <div
        style={{
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px", // Espacio entre las tarjetas
            maxWidth: "1200px", // Ajusta según el ancho máximo que quieras
            justifyContent: "center",
          }}
        >
          {
            [
              { title: 'Facturacion', image: <GMenuCheckoutIcon width='calc(50%)' />, action: () => navigate('/main/sales/new') }, // 0
              { title: 'Compra Productos', image: <GBottlesIcon width='calc(50%)' />, action: () => navigate('/main/purchases/products/new') }, // 1
              // { title: 'Compras M. Prima', image: <GMaterialsIcon width='calc(50%)' />, action: () => navigate('/main/purchases/rawmaterials/new') }, // 1
              { title: 'Gastos', image: <GMenuExpensesIcon width='calc(50%)' />, action: () => navigate('/main/expenses/new') }, // 2
              { title: 'Ctas. Por Cobrar', image: <GMenuDueAccountIcon width='calc(50%)' />, action: () => navigate('/main/pending-accounts/to-collect') }, // 3
              { title: 'Ctas. Por Pagar', image: <GMenuDueAccountIcon1 width='calc(50%)' />, action: () => navigate('/main/pending-accounts/to-pay') }, // 3
              { title: 'Inv. Productos', image: <GShelveIcon width='calc(50%)' />, action: () => navigate('/main/inventory/products') }, // 3
              // { title: 'Inv. Mat. Prima', image: <GShelveIcon width='calc(50%)' />, action: () => navigate('/main/inventory/rawmaterials') }, // 3
              { title: 'Mi Caja', image: <GCashierIcon width='calc(50%)' />, action: () => navigate('/main/my-cashier') }, // 3
              { title: 'Clientes', image: <GMenuCustomersIcon width='calc(50%)' />, action: () => navigate('/main/administration/customers') }, // 3
              { title: 'Categorias', image: <GMenuCategoriesIcon width='calc(50%)' />, action: () => navigate('/main/administration/categories') }, // 3
              { title: 'Marcas', image: <GMenuBrandsIcon width='calc(50%)' />, action: () => navigate('/main/administration/brands') }, // 3
              { title: 'Salir', image: <GLogoutIcon width='calc(50%)' />, action: () => logoutAction() }, // 9
            ].map((element, index) => (
              <MainMenuCard onClick={element.action}>
                {element.image}
                <p className='label'>{element.title}</p>
              </MainMenuCard>
            ))
          }
        </div>
      </div>
    </Wrapper>
  );
}

export default Main;
