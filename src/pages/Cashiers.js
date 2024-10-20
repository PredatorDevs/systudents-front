import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Col, Row, Space, Tooltip } from 'antd';
import { EditTwoTone, EyeTwoTone, InfoCircleTwoTone, SyncOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { Wrapper } from '../styled-components/Wrapper';

import cashiersServices from '../services/CashiersServices.js';
import { isEmpty } from 'lodash';
// import moment from 'moment';
import 'moment/locale/es-mx';

import Meta from 'antd/lib/card/Meta';

import cashierIcon from '../img/icons/main/cashier.png';
import CashierInformationPreview from '../components/previews/CashierInfomationPreview';
import EditCashierForm from '../components/forms/EditCashierForm.js';

function Cashiers() {
  const [fetching, setFetching] = useState(false);
  const [openCashierInfoPrev, setOpenCashierInfoPrev] = useState(false);
  const [openCashierEditForm, setOpenCashierEditForm] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [entitySelectedData, setEntitySelectedData] = useState({});
  
  const navigate = useNavigate();

  async function loadData() {
    setFetching(true);
    try {
      const response = await cashiersServices.find();
      setEntityData(response.data);
    } catch(error) {
      console.error(error);
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size='large'
            icon={<SyncOutlined />}
            loading={fetching}
            onClick={() => {
              loadData();
            }}
          >
            Actualizar
          </Button>
        </Col>
        <Col span={24}>
        </Col>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {
            (!isEmpty(entityData) ? entityData : []).map((element, index) => (
              <Card
                key={index}
                style={{
                  width: 300,
                  margin: 10,
                  backgroundColor: element.isOpen ? "#d9f7be" : "#fafafa",
                  boxShadow: '3px 3px 5px 0px #d9d9d9',
                  border: '1px solid #d9d9d9'
                }}
                actions={[
                  <Space key="1">
                    <Tooltip key="1a" placement="top" title={`Información`}>
                      <Button
                        key="1aa"
                        onClick={() => {
                          setEntitySelectedData(element);
                          setOpenCashierInfoPrev(true);
                        }}
                        icon={<InfoCircleTwoTone />}
                      />
                    </Tooltip>
                    <Tooltip key="1b" placement="top" title={`Editar`}>
                      <Button
                        key="1bb"
                        onClick={() => {
                          setEntitySelectedData(element);
                          setOpenCashierEditForm(true);
                        }}
                        icon={<EditTwoTone />}
                      />
                    </Tooltip>
                    <Tooltip key="1c" placement="top" title={`Ver`}>
                      <Button
                        key="1bb"
                        onClick={() => { navigate('/main/my-cashier', { state: { cashierId: element.id } })}}
                        icon={<EyeTwoTone />}
                      />
                    </Tooltip>
                  </Space>,
                  <Button
                    key="3"
                    type={'primary'}
                  >
                    {
                      element.isOpen ? 'Cerrar caja' : 'Aperturar caja'
                    }
                  </Button>,
                ]}
              >
                <Meta
                  avatar={<Avatar src={cashierIcon} shape='square' />}
                  title={element.name}
                  description={
                    <>
                      <p style={{ margin: 0 }}>{`${element.isOpen ? `Caja abierta - Turno #${element.currentShiftcutNumber}` : "Caja cerrada"}`}</p>
                      <p style={{ margin: '5px 0px 0px 0px', fontSize: 11 }}>{element.locationName}</p>
                      <p style={{ margin: '5px 0px 0px 0px', fontSize: 9 }}>{`CId: ${element.id} - SId: ${element.currentShiftcutId || ''}`}</p>
                    </>
                  }
                />
              </Card>
            ))
          }
          
        </Col>
      </Row>
      <CashierInformationPreview
        open={openCashierInfoPrev}
        cashierData={entitySelectedData || {}}
        onClose={() => {
          setEntitySelectedData({});
          setOpenCashierInfoPrev(false);
        }}
      />
      <EditCashierForm
        open={openCashierEditForm}
        cashierData={entitySelectedData || {}}
        onClose={(reload) => {
          setEntitySelectedData({});
          setOpenCashierEditForm(false);
          if (reload) loadData();
        }}
      />
    </Wrapper>
  );
}

export default Cashiers;
