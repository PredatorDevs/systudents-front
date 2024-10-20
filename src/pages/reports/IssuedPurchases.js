import React, { useState } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { Tabs } from 'antd';

import IssuedPurchasesByDate from './IssuedPurchasesByDate';

function IssuedPurchases() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();

  const tabItems = [
    {
      label: 'Por Mes',
      key: 'item-1',
      children: <IssuedPurchasesByDate />
    },
    // {
    //   label: 'Por Correlativo',
    //   key: 'item-2',
    //   children: <IssuedSalesByDocNumber />
    // },
    // {
    //   label: 'Por Cliente',
    //   key: 'item-3',
    //   children: <IssuedSalesByCustomer />
    // },
    // {
    //   label: 'Por Producto',
    //   key: 'item-4',
    //   children: <IssuedSalesByProduct />
    // }
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

export default IssuedPurchases;
