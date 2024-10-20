import React, { useState } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { Tabs } from 'antd';

import IssuedSalesByDocNumber from './IssuedSalesByDocNumber';
import IssuedSalesByCustomer from './IssuedSalesByCustomer';
import IssuedSalesByProduct from './IssuedSalesByProduct';
import IssuedSalesByDate from './IssuedSalesByDate';

function IssuedSales() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();

  const tabItems = [
    {
      label: 'Por Fecha',
      key: 'item-1',
      children: <IssuedSalesByDate />
    },
    {
      label: 'Por Correlativo',
      key: 'item-2',
      children: <IssuedSalesByDocNumber />
    },
    {
      label: 'Por Cliente',
      key: 'item-3',
      children: <IssuedSalesByCustomer />
    },
    {
      label: 'Por Producto',
      key: 'item-4',
      children: <IssuedSalesByProduct />
    }
  ];

  return (
    <Wrapper>
      <Tabs
        style={{ width: '100%' }}
        type={'card'}
        items={tabItems}
      />
    </Wrapper>
  );
}

export default IssuedSales;
