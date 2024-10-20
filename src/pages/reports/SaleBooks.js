import React, { useState, useEffect } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { Tabs } from 'antd';

import FinalConsumerSaleBook from './SaleBooks/FinalConsumerSaleBook';
import TaxPayerSaleBook from './SaleBooks/TaxPayerSaleBook';

function SaleBooks() {
  const navigate = useNavigate();
  const [fetching, setFetching] = useState();

  useEffect(() => {

  }, []);

  const tabItems = [
    {
      label: 'Ventas al Consumidor',
      key: 'item-1',
      children: <FinalConsumerSaleBook />
    },
    {
      label: 'Ventas al Contribuyente',
      key: 'item-2',
      children: <TaxPayerSaleBook />
    },
  ];

  const mainTabItems = [
    {
      label: 'Formato Clásico',
      key: 'item-1',
      children: <Tabs
        type={'card'}
        items={tabItems}
        style={{ width: '100%' }}
      />
    },
    {
      label: 'Formato DTE',
      key: 'item-2',
      children: <Tabs
        type={'card'}
        items={[]}
        style={{ width: '100%' }}
      />
    },
  ];

  return (
    <Wrapper>
      <Tabs
        type={'card'}
        items={mainTabItems}
        style={{ width: '100%' }}
      />
    </Wrapper>
  );
}

export default SaleBooks;
