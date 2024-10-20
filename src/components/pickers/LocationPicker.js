import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button } from 'antd';
import productsServices from '../../services/ProductsServices';
import { isNumber } from 'lodash';
import { customNot } from '../../utils/Notifications';
import { HomeOutlined, LockFilled } from '@ant-design/icons';
import locationsService from '../../services/LocationsServices';

export default function LocationPicker(props) {
  const [fetching, setFetching] = useState(false);
  const [locationsData, setLocationsData] = useState([]);

  const { onSelect, open, showAllOption, onClose } = props;

  async function loadData() {
    setFetching(true);
    try {
      const res = await locationsService.find();
      setLocationsData(res.data);
    } catch(error) {

    }
    setFetching(false);
  }
  useEffect(() => {
    loadData();
  }, [])

  return (
    <Modal
      title={'Seleccione una sucursal'}
      centered
      width={500}
      closable={false}
      maskClosable={false}
      open={open}
      footer={null}
    >      
      <Row gutter={[8, 8]}>
        <Col span={12} style={{ display: showAllOption ? 'flex' : 'none' }}>
          <Button
            icon={<HomeOutlined />}
            onClick={() => {
              onSelect(0);
              onClose();
            }}
            style={{ width: '100%', textAlign: 'left' }}
            // icon={index !== 0 ? <LockFilled /> : <></>}
          >
            {`Todas`}
          </Button>
        </Col>
        {
          (locationsData || []).map((element, index) => (
            <Col key={index} span={12}>
              <Button
                // type={'primary'}
                icon={<HomeOutlined />}
                onClick={() => {
                  onSelect(element.id || 0);
                  onClose();
                }}
                style={{ width: '100%', textAlign: 'left' }}
                // icon={index !== 0 ? <LockFilled /> : <></>}
              >
                {`${element.name}`}
              </Button>
            </Col>
          ))
        }
      </Row>
      <Button
        style={{ width: '100%', marginTop: '20px' }}
        type='default'
        danger
        onClick={() => onClose()}
        loading={fetching}
      >
        Cerrar
      </Button>
    </Modal>
  );
}