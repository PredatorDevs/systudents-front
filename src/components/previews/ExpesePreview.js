import React, { useState, useEffect, useRef } from 'react';
import { Col, Row, Divider, PageHeader, Modal, Statistic, Card, Descriptions, List, Button, Spin } from 'antd';
import { CloseOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';
import moment from 'moment';
import 'moment/locale/es-mx';
import ReactToPrint from 'react-to-print';

import salesServices from '../../services/SalesServices.js';
import { customNot } from '../../utils/Notifications.js';
import policiesServices from '../../services/PoliciesServices.js';
import expensesServices from '../../services/ExpensesServices.js';

import pdfIcon from '../../img/icons/attachments/pdf.png';
import docIcon from '../../img/icons/attachments/doc.png';
import jpgIcon from '../../img/icons/attachments/jpg.png';
import pngIcon from '../../img/icons/attachments/png.png';
import xlsIcon from '../../img/icons/attachments/xls.png';
import AuthorizeAction from '../confirmations/AuthorizeAction.js';

function ExpensePreview(props) {
  const [fetching, setFetching] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [attachmentsData, setAttachmentsData] = useState([]);
  const [entityDetailData, setEntityDetailData] = useState([]);
  const [wasVoided, setWasVoided] = useState(false);
  const [openVoidConfirmation, setOpenVoidConfirmation] = useState(false);

  const { open, expenseId, onClose } = props;

  const componentRef = useRef();

  function loadData() {
    if (expenseId) {
      setFetching(true);
      expensesServices.findById(expenseId)
      .then((response) => {
        setEntityData(response.data);
        // prompt("Copy to clipboard: Ctrl+C, Enter", JSON.stringify(response.data));
        expensesServices.getAttachmentsById(expenseId)
        .then((response) => {
          setAttachmentsData(response.data);
          setFetching(false);
        }).catch((error) => {
          customNot('error', 'Información de adjuntos no encontrada', 'Revise conexión')
          setFetching(false);
        });
      }).catch((error) => {
        customNot('error', 'Información de gasto no encontrada', 'Revise conexión')
        setFetching(false);
      });
    }
  }

  function getAttachmentIcon(fileExt) {
    switch(fileExt) {
      case 'pdf': return pdfIcon;
      case 'png': return pngIcon;
      case 'jpeg':
      case 'jpg':
        return jpgIcon;
      case 'xls':
      case 'xlsx':
        return xlsIcon;
      case 'doc':
      case 'docx':
        return docIcon;
      default: return pdfIcon;
    }
  }

  useEffect(() => {
    loadData();
  }, [ expenseId ]);

  function voidExpense(userId) {
    setFetching(true);
    expensesServices.voidById(userId, expenseId)
    .then((response) => {
      customNot('info', 'Gasto anulado', 'Acción exitosa');
      setWasVoided(true);
      loadData();
      setFetching(false);
    })
    .catch((error) => {
      setFetching(false);
      customNot('error', 'Algo salió mal', 'El Gasto no fue anulado');
    })
  }

  return (
    <Modal
      title={
        <PageHeader
          onBack={() => null}
          backIcon={<TagsOutlined />}
          title={`Gasto ${isEmpty(entityData) ? '' : `#${entityData[0].documentNumber} ` || ''}`}
          subTitle={`Cod: ${expenseId} ${isEmpty(entityData) ? '' : entityData[0].isVoided ? 'Anulado' : ''}`}
          extra={[
            isEmpty(entityData) ? 
              <></> : 
              entityData[0].isVoided ? 
                <></> : 
                <Button key="2" size={'small'} type={'primary'} danger icon={<DeleteOutlined />} onClick={() => setOpenVoidConfirmation(true)} loading={fetching}>Anular</Button>
          ]}
        />
      }
      centered
      width={700}
      closeIcon={<CloseOutlined style={{ padding: 5, backgroundColor: '#f0f0f0', borderRadius: 5, color: '#f5222d' }} />}
      onCancel={() => {
        onClose(wasVoided);
      }}
      maskClosable={false}
      open={open}
      footer={null}
    >
      <Spin tip="Cargando información" size="large" spinning={fetching}>
        {/* <Row gutter={[16, 16]}>
          <Col span={4} style={{ backgroundColor: '#f0f0f0', borderRadius: 5 }}>
            <p style={{ margin: 0, fontSize: 14 }}>Fecha:</p>
          </Col>
          <Col span={8}>
            <p style={{ margin: 0, fontSize: 14 }}>{`${isEmpty(entityData) ? '' : `${entityData[0].documentDatetime}` || '-'}`}</p>
          </Col>
          <Col span={4} style={{ backgroundColor: '#f0f0f0', borderRadius: 5 }}>
            <p style={{ margin: 0, fontSize: 14 }}>Monto:</p>
          </Col>
          <Col span={8}>
            <p style={{ margin: 0, fontSize: 14 }}>{`$${isEmpty(entityData) ? '' : `${Number(entityData[0].amount).toFixed(2)}` || '-'}`}</p>
          </Col>
          
          <Col span={4} style={{ backgroundColor: '#f0f0f0', borderRadius: 5 }}>
            <p style={{ margin: 0, fontSize: 14 }}>Concepto:</p>
          </Col>
          <Col span={20}>
            <p style={{ margin: 0, fontSize: 14 }}>{`${isEmpty(entityData) ? '' : `${entityData[0].concept}` || '-'}`}</p>
          </Col>
          <Col span={4} style={{ backgroundColor: '#f0f0f0', borderRadius: 5 }}>
            <p style={{ margin: 0, fontSize: 14 }}>Descripción:</p>
          </Col>
          <Col span={20}>
            <p style={{ margin: 0, fontSize: 14 }}>{`${isEmpty(entityData) ? '' : `${entityData[0].description}` || '-'}`}</p>
          </Col>
          <Col span={4} style={{ backgroundColor: '#f0f0f0', borderRadius: 5 }}>
            <p style={{ margin: 0, fontSize: 12 }}>Registrado por:</p>
          </Col>
          <Col span={8}>
            <p style={{ margin: 0, fontSize: 14 }}>{`${isEmpty(entityData) ? '' : `${entityData[0].createdByFullname}` || '-'}`}</p>
          </Col>
          <Divider></Divider>
          <Col span={8}>
            <p style={{ margin: 0, fontSize: 10 }}>Tipo</p>
            <p style={{ margin: 0, fontSize: 14 }}>{`${isEmpty(entityData) ? '' : `${entityData[0].expenseTypeName}` || '-'}`}</p>
          </Col>
          <Col span={8}>
            <p style={{ margin: 0, fontSize: 10 }}>Pago</p>
            <p style={{ margin: 0, fontSize: 14 }}>{`${isEmpty(entityData) ? '' : `${entityData[0].paymentMethodName}` || '-'}`}</p>
          </Col>
          <Col span={8}>
            <p style={{ margin: 0, fontSize: 10 }}>Cuenta</p>
            <p style={{ margin: 0, fontSize: 14 }}>{`${isEmpty(entityData) ? '' : `${entityData[0].accountingName}` || '-'}`}</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{`${isEmpty(entityData) ? '' : `${entityData[0].accountingNum}` || '-'}`}</p>
          </Col>
          {
            isEmpty(attachmentsData) ? <></> : <>
              <Divider></Divider>
              {
                attachmentsData.map((element, index) => (
                  <>
                    <Col span={2} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src={getAttachmentIcon(element.fileExtension)} width={35} />
                    </Col>
                    <Col span={22} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <a style={{ margin: 0, fontSize: 12 }} href={element.fileUrl} target={'_blank'}>{element.fileName}</a>
                    </Col>
                  </>
                ))
              }
            </>
          }
        </Row> */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Descriptions
              style={{ width: '100%' }}
              labelStyle={{ fontSize: 12, padding: '3px 5px', margin: 0, fontStyle: 'italic', backgroundColor: '#f6ffed', border: '1px solid #bfbfbf' }}
              contentStyle={{ fontSize: 14, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
              bordered
              column={4}
            >
              <Descriptions.Item label="Tipo de Gasto" span={2}>{entityData[0]?.expenseTypeName}</Descriptions.Item>
              <Descriptions.Item label="Método de Pago" span={2}>{entityData[0]?.paymentMethodName}</Descriptions.Item>
              <Descriptions.Item label="Cuenta Contable" span={2}>{entityData[0]?.accountingName}</Descriptions.Item>
              <Descriptions.Item label="Número de Cuenta" span={2}>{entityData[0]?.accountingNum}</Descriptions.Item>
              <Descriptions.Item label="Número de Documento" span={2}>{entityData[0]?.documentNumber}</Descriptions.Item>
              <Descriptions.Item label="Fecha de Documento" span={2}>{entityData[0]?.documentDatetime}</Descriptions.Item>
              <Descriptions.Item label="Concepto" span={4}>{entityData[0]?.concept}</Descriptions.Item>
              <Descriptions.Item label="Descripción" span={4}>{entityData[0]?.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Gravado" span={2}>{Number(entityData[0]?.taxedAmount).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="Exento" span={2}>{Number(entityData[0]?.noTaxedAmount).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="Bonos" span={2}>{Number(entityData[0]?.bonus).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="Descuentos" span={2}>{Number(entityData[0]?.discounts).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="IVA" span={2}>{Number(entityData[0]?.iva).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="FOVIAL" span={2}>{Number(entityData[0]?.fovial).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="COTRANS" span={2}>{Number(entityData[0]?.cotrans).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="IVA Retenido" span={2}>{Number(entityData[0]?.ivaRetention).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="IVA Percibido" span={2}>{Number(entityData[0]?.ivaPerception).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="Total" span={2}>{Number(entityData[0]?.amount).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="" span={2}>{''}</Descriptions.Item>
              <Descriptions.Item label="Creado por" span={4}>{entityData[0]?.createdByFullname}</Descriptions.Item>
              {/* <Descriptions.Item label="Estado" span={4}>{entityData[0]?.isActive ? 'Activo' : 'Inactivo'}</Descriptions.Item> */}
              <Descriptions.Item label="Anulado" span={4}>{entityData[0]?.isVoided ? 'Sí' : 'No'}</Descriptions.Item>
            </Descriptions>
          </Col>
          {
            isEmpty(attachmentsData) ? <></> : <>
              <Divider></Divider>
              {
                attachmentsData.map((element, index) => (
                  <>
                    <Col span={2} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src={getAttachmentIcon(element.fileExtension)} width={35} />
                    </Col>
                    <Col span={22} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <a style={{ margin: 0, fontSize: 12 }} href={element.fileUrl} target={'_blank'}>{element.fileName}</a>
                    </Col>
                  </>
                ))
              }
            </>
          }
        </Row>
      </Spin>
      <AuthorizeAction
        open={openVoidConfirmation}
        allowedRoles={[1, 2]}
        title={`Anular gasto #${expenseId}`}
        confirmButtonText={'Confirmar anulación'}
        actionType={`Anular gasto - Cod Interno: ${expenseId}`}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            const { userId } = userAuthorizer;
            voidExpense(userId);
          }
          setOpenVoidConfirmation(false);
        }}
      />
    </Modal>
  )
}

export default ExpensePreview;
