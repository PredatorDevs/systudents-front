import React, { useState, useEffect } from 'react';
import { Wrapper } from '../styled-components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import { Col, Descriptions, PageHeader, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import customersServices from '../services/CustomersServices';

function CustomerProfile() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [fetching, setFetching] = useState();
  const [customerData, setCustomerData] = useState();

  useEffect(() => {
    
  }, []);
  
  useEffect(() => {
    if (state !== null) {
      loadData(state.customerId);
    }
  }, []);

  async function loadData(id) {
    setFetching(true);
    try {
      const response = await customersServices.findById(id);
      console.log(response.data);
      setCustomerData(response.data);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  return (
    <Wrapper>
      {
        state?.customerId !== 0 && state?.customerId !== null ? (
          <>
            <PageHeader
              onBack={() => {
                navigate('/main/administration/customers')
              }}
              backIcon={<ArrowLeftOutlined />}
              title={`Gustavo Sanchez`}
              subTitle={'SigPro COM'}
              style={{ margin: 0, marginBottom: 20, padding: 0 }}
            />
            <Row gutter={[8, 8]} style={{ width: '100%' }}>
              <Col span={24}>
                <Descriptions
                  size="small"
                  style={{ width: '100%' }}
                  column={3}
                  bordered
                >
                  <Descriptions.Item label="Created">Lili Qu</Descriptions.Item>
                  <Descriptions.Item label="Association">
                    <a>421421</a>
                  </Descriptions.Item>
                  <Descriptions.Item label="Creation Time">2017-01-10</Descriptions.Item>
                  <Descriptions.Item label="Effective Time">2017-10-10</Descriptions.Item>
                  <Descriptions.Item label="Remarks">
                    Gonghu Road, Xihu District, Hangzhou, Zhejiang, China
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </>
        ) : (
          <></>
        )
      }
    </Wrapper>
  );
}

export default CustomerProfile;
