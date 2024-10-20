import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button } from 'antd';
import productsServices from '../../services/ProductsServices';
import { isNumber } from 'lodash';
import { customNot } from '../../utils/Notifications';
import { LockFilled } from '@ant-design/icons';
import AuthorizeAction from '../confirmations/AuthorizeAction';

export default function ProductPricePicker(props) {
  const [fetching, setFetching] = useState(false);
  const [openAuthPrice, setOpenAuthPrice] = useState(false);
  const [prefPriceValue, setPrefPriceValue] = useState(null);
  const [productPrices, setProductPrices] = useState([]);

  const { onSelect, open, onClose, productId } = props;

  useEffect(() => {
    if (isNumber(productId) && productId !== 0) {
      setFetching(true);
      productsServices.prices.findByProductId(productId)
      .then((response) => {
        const { data } = response;
        setProductPrices(data);
        setFetching(false);
      })
      .catch((error) => {
        customNot('error', 'Sin información', 'Revise su conexión a la red');
        setFetching(false);
      });
    }
  }, [ productId ])

  return (
    <Modal
      title={'Seleccione un precio'}
      centered
      width={450}
      closable={false}
      maskClosable={false}
      open={open}
      footer={null}
    >      
      <Row gutter={[8, 8]}>
        {
          (productPrices || []).map((element, index) => (
            <Col key={index} span={8}>
              <p>{`Precio ${index + 1}`}</p>
              <Button
                type={'primary'}
                onClick={() => {
                  if (element.requireAuthToApply === 1) {
                    setOpenAuthPrice(true);
                    setPrefPriceValue(element.price || 0.00);
                  } else {
                    onSelect(element.price || 0.00);
                    onClose();
                  }
                }}
                icon={element.requireAuthToApply === 1 ? <LockFilled /> : <></>}
              >
                {`$${element.price}`}
              </Button>
            </Col>
          ))
        }
      </Row>
      <Button style={{ width: '100%', marginTop: '20px' }} type='default' danger onClick={() => onClose()} >Cerrar</Button>
      <AuthorizeAction
        open={openAuthPrice}
        allowedRoles={[1, 2]}
        title={`Autorizar precio preferencial`}
        confirmButtonText={'Confirmar'}
        actionType={'Seleccionar precio que requiere autorizacion para aplicar a Venta'}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            const { userId, roleId } = userAuthorizer;
            // setDisabledPriceEditInput(false);
            setOpenAuthPrice(false);
            onSelect(prefPriceValue || 0.00);
            onClose();
          }
          setOpenAuthPrice(false);
        }}
      />
    </Modal>
  );
}