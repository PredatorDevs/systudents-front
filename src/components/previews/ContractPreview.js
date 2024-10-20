import React, { useState, useEffect, useRef } from 'react';
import { Col, Row, Button, PageHeader, Modal, Descriptions, Table, Tag, Result, Card, Statistic, Space } from 'antd';
import { CloseOutlined,  DeleteOutlined,  DeleteTwoTone,  DollarTwoTone,  FileExcelTwoTone,  FileOutlined, FilePdfTwoTone, FileTwoTone, LikeOutlined, ManOutlined, PrinterFilled, SyncOutlined, WomanOutlined } from '@ant-design/icons';
import { find, forEach, isEmpty } from 'lodash';
import moment from 'moment';
import 'moment/locale/es-mx';
import ReactToPrint from 'react-to-print';

import salesServices from '../../services/SalesServices.js';
import { columnDatetimeDef, columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions.js';
import AuthorizeAction from '../confirmations/AuthorizeAction.js';
import ConsumidorFinal from '../invoices/ConsumidorFinal.js';
import generalsServices from '../../services/GeneralsServices.js';
import { printerServices } from '../../services/PrintersServices.js';
import { numberToLetters } from '../../utils/NumberToLetters.js';
import { customNot } from '../../utils/Notifications.js';
import contractsServices from '../../services/ContractsServices.js';

function ContractPreview(props) {
  const [fetching, setFetching] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [entityDetailData, setEntityDetailData] = useState([]);
  const [wasVoided, setWasVoided] = useState(false);
  const [openRejectConfirmation, setOpenRejectConfirmation] = useState(false);
  const [openConfirmConfirmation, setOpenConfirmConfirmation] = useState(false);

  const [taxesData, setTaxesData] = useState([]);

  const { open, contractId, onClose } = props;

  const ticketComponentRef = useRef();
  const cfComponentRef = useRef();
  const ccfComponentRef = useRef();

  async function loadData() {
    setFetching(true);
    try {
      const res = await contractsServices.findById(contractId);
      setEntityData(res.data);
      const taxesResponse = await generalsServices.findTaxes();
      setTaxesData(taxesResponse.data);
    } catch (error) {
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
    setWasVoided(false);
  }, [ contractId ]);

  function getDetailTotalTaxesById(taxId) {
    let totalTaxes = 0;

    forEach(entityDetailData, (saleDetail) => {
      forEach(saleDetail.taxesData, (taxDetail) => {
        if (taxId === taxDetail.taxId) {
          if (taxDetail.isPercentage === 1) {
            totalTaxes += (((saleDetail.quantity * saleDetail.unitPrice) / (1 + +taxDetail.taxRate)) * +taxDetail.taxRate);
          } else {
            totalTaxes += (saleDetail.quantity * ++taxDetail.taxRate);
          }
        }
      });
    });

    return totalTaxes || 0;
  }

  async function rejectContract() {
    setFetching(true);
    try {
      const res = await contractsServices.changeStatus(contractId, 3);
      customNot('warning', 'El contrato ha sido marcado como rechazado', 'Accion irreversible');
      loadData();
    } catch (error) {
    }
    setFetching(false);
  }

  async function confirmContract() {
    setFetching(true);
    try {
      const res = await contractsServices.changeStatus(contractId, 2);
      customNot('success', 'El contrato ha sido marcado como aceptado', 'Accion irreversible');
      loadData();
    } catch (error) {
    }
    setFetching(false);
  }

  return (
    <Modal
      title={
        <PageHeader
          onBack={() => null}
          backIcon={null}
          title={`${`Contrato #${contractId}` || ''}`}
          // subTitle={`${customerFullname}`}
          style={{ padding: 0 }}
        />
      }
      centered
      bodyStyle={{ padding: 15 }}
      width={650}
      closeIcon={<CloseOutlined style={{ padding: 5, backgroundColor: '#f0f0f0', borderRadius: 5, color: '#f5222d' }} />}
      onCancel={() => onClose(wasVoided)}
      maskClosable={false}
      open={open}
      footer={null}
    >
      {
        isEmpty(entityData)
        && isEmpty(entityData[0])
        && isEmpty(entityData[1])
        && isEmpty(entityData[2])
        && isEmpty(entityData[3]) ? <Result>
          <Result
            status="warning"
            title={<p style={{ color: '#FAAD14' }}>{fetching ? 'Cargando...' : 'No se pudo obtener información de este contrato'}</p>}
            extra={
              <Button
                type="primary"
                key="console"
                onClick={() => {
                  onClose(wasVoided);
                }}
              >
                Cerrar
              </Button>
            }
          />
        </Result> : <Row gutter={[8, 16]}>
          <Col
            span={24}
            style={{ display: entityData[0][0]?.contractStatus === 1 ? 'flex' : 'none' }}
          >
            <Space>
              <Button
                type='primary'
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setOpenRejectConfirmation(true);
                }}
              >
                Rechazar
              </Button>
              <Button
                type='primary'
                icon={<LikeOutlined />}
                onClick={() => {
                  setOpenConfirmConfirmation(true);
                }}
              >
                Aceptar
              </Button>
            </Space>
          </Col>
          <Col span={24}>
            <Descriptions
              bordered
              labelStyle={{ fontSize: 10, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
              contentStyle={{ fontSize: 12, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
              style={{ width: '100%' }}
              size={'small'}
            >
              <Descriptions.Item label="Estado" span={3}>
                <Tag
                  color={
                    entityData[0][0]?.contractStatus === 1 ? 'orange' : entityData[0][0]?.contractStatus === 2 ? 'geekblue' : entityData[0][0]?.contractStatus === 3 ? 'magenta' : 'white'
                  }
                >
                  {entityData[0][0]?.statusName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha" span={3}>{moment(entityData[0][0]?.contractDatetime).format('LL') || ''}</Descriptions.Item>
              <Descriptions.Item label="Cliente" span={3}>{entityData[0][0]?.customerFullname || ''}</Descriptions.Item>
              <Descriptions.Item label="Lugar de nacimiento" span={3}>{entityData[0][0]?.customerBirthplace || ''}</Descriptions.Item>
              <Descriptions.Item label="Fecha de nacimiento" span={3}>{moment(entityData[0][0]?.customerBirthdate).format('LL') || ''}</Descriptions.Item>
              <Descriptions.Item label="Edad" span={1}>{moment().diff(moment(entityData[0][0]?.customerBirthdate), 'years') || ''}</Descriptions.Item>
              <Descriptions.Item label="Sexo" span={1}>
              {
                entityData[0][0]?.customerGender === 'M' ? <Tag icon={<ManOutlined />} color={'blue'}>Hombre</Tag>
                : entityData[0][0]?.customerGender === 'F' ? <Tag icon={<WomanOutlined />} color={'pink'}>Mujer</Tag> :
                <></>
              }
              </Descriptions.Item>
              <Descriptions.Item label="DUI" span={1}>{entityData[0][0]?.customerDui || ''}</Descriptions.Item>
              <Descriptions.Item label="Ocupacion" span={1}>{entityData[0][0]?.customerOccupation || ''}</Descriptions.Item>
              <Descriptions.Item label="Direccion" span={3}>{entityData[0][0]?.customerAddress || ''}</Descriptions.Item>
              <Descriptions.Item label="Telefono" span={1}>{entityData[0][0]?.customerDefPhoneNumber || ''}</Descriptions.Item>
              <Descriptions.Item label="Lugar de trabajo" span={2}>{entityData[0][0]?.customerJobAddress || ''}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={24}>
            <Table
              bordered
              size='small'
              columns={[
                columnDef({ title: 'Cantidad', dataKey: 'quantity', fSize: 11 }),
                columnDef({title: 'Descripcion', dataKey: 'productName', fSize: 11}),
                columnMoneyDef({
                  title: 'Precio Unitario',
                  dataKey: 'unitPrice',
                  showDefaultString: true, fSize: 11
                }),
                columnMoneyDef({
                  title: 'Subtotal',
                  fSize: 11,
                  dataKey: 'taxableSubTotal',
                  showDefaultString: true
                }),
              ]}
              rowKey={'id'}
              dataSource={[
                ...entityData[1],
              ] || []}
              pagination={false}
              loading={fetching}
            />
          </Col>
          <Col span={24}>
            <p>Beneficiarios</p>
            <Table
              bordered
              size='small'
              columns={[
                columnDef({title: 'Nombre completo', dataKey: 'fullname', fSize: 11 }),
                columnDef({title: 'Edad', dataKey: 'age', fSize: 11}),
                columnDef({title: 'Dirección', dataKey: 'address', fSize: 11})
              ]}
              rowKey={'id'}
              dataSource={[
                ...entityData[3],
              ] || []}
              pagination={false}
              loading={fetching}
            />
          </Col>
          <Col span={24}>
            <p>Plan de pago</p>
            <Table
              bordered
              size='small'
              columns={[
                columnDatetimeDef({ title: 'Fecha de pago', dataKey: 'expectedPaymentDate', fSize: 11 }),
                columnMoneyDef({title: 'Monto de cuota', dataKey: 'expectedPaymentAmount', fSize: 11})
              ]}
              rowKey={'contractPaymentPlanId'}
              dataSource={[
                ...entityData[2],
              ] || []}
              pagination={false}
              loading={fetching}
            />
          </Col>
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
          >
            <Statistic
              title={<p style={{ color: 'black' }}>{'TOTAL'}</p>}
              value={entityData[0][0]?.contractTotal}
              precision={2}
              prefix={<DollarTwoTone twoToneColor={'blue'} style={{ fontSize: 16 }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
          >
            <Statistic
              title={<p style={{ color: 'black' }}>{'PRIMA'}</p>}
              value={entityData[0][0]?.downPayment}
              precision={2}
              prefix={<DollarTwoTone twoToneColor={'blue'} style={{ fontSize: 16 }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
          >
            <Statistic
              title={<p style={{ color: 'black' }}>{'NUM PAGOS'}</p>}
              value={entityData[0][0]?.numberOfPayments}
              precision={0}
              prefix={<FileTwoTone twoToneColor={'blue'} style={{ fontSize: 16 }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              margin: '10px 5px',
              backgroundColor: "#fafafa",
              boxShadow: '3px 3px 5px 0px #d9d9d9',
              border: '1px solid #d9d9d9',
              borderRadius: 5
            }}
            size='small'
          >
            <Statistic
              title={<p style={{ color: 'black' }}>{'CUOTA'}</p>}
              value={
                (entityData[0][0]?.contractTotal - entityData[0][0]?.downPayment) / entityData[0][0]?.numberOfPayments
              }
              precision={2}
              prefix={<DollarTwoTone twoToneColor={'blue'} style={{ fontSize: 16 }} />}
            />
          </Card>
        </Col>
        <Col span={24}>
          <p style={{ margin: '0px', fontSize: 12 }}>{'Observaciones:'}</p>
          
        </Col>
          {/* <Col span={12}>
            <Descriptions
              bordered
              style={{ width: '100%' }}
              labelStyle={{ fontSize: 10, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
              contentStyle={{ fontSize: 12, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf' }}
              size={'small'}
            >
              <Descriptions.Item label="SON" span={3}>
                {`${numberToLetters(entityData[0]?.total)}`}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              bordered
              style={{ width: '100%' }}
              labelStyle={{ fontSize: 10, padding: '3px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf', textAlign: 'right' }}
              contentStyle={{ fontSize: 12, padding: '3px 5px', margin: 0, border: '1px solid #bfbfbf', textAlign: 'right' }}
              size={'small'}
            >
              <Descriptions.Item label="GRAVADO" span={3}>
                {`$${
                  (entityData[0]?.documentTypeId === 1 || entityData[0]?.documentTypeId === 2)
                    ? entityData[0]?.taxableSubTotal || 0 
                    : entityData[0]?.taxableSubTotalWithoutTaxes || 0
                }`}
              </Descriptions.Item>
              {
                !(entityData[0]?.documentTypeId === 1 || entityData[0]?.documentTypeId === 2) ? taxesData.map((element, index) => {
                  let dataValue = getDetailTotalTaxesById(element.id).toFixed(2);
                  return (
                    <Descriptions.Item key={index} label={`${element.name}`} span={3}>{`$${dataValue}`}</Descriptions.Item>
                  );
                }) : <></>
              }
              <Descriptions.Item label="SUBTOTAL" span={3}>
                {`$${entityData[0]?.taxableSubTotal}`}
              </Descriptions.Item>
              <Descriptions.Item label="EXENTO" span={3}>
                {`$${entityData[0]?.noTaxableSubTotal}`}
              </Descriptions.Item>
              <Descriptions.Item label="TOTAL" span={3}>
                {`$${entityData[0]?.total}`}
              </Descriptions.Item>
            </Descriptions>
          </Col> */}
          <Descriptions bordered style={{ width: '100%' }} size={'small'}>
            <Descriptions.Item label="Registrada por" span={3}>{entityData[0][0]?.createdByFullname || ''}</Descriptions.Item>
          </Descriptions>
        </Row>
      }
      <AuthorizeAction
        open={openRejectConfirmation}
        allowedRoles={[1]}
        title={`Rechazar Contrato #${contractId}`}
        confirmButtonText={'Confirmar rechazo'}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            // const { userId } = userAuthorizer;
            // voidSale(userId);
            rejectContract();
            setWasVoided(true);
            loadData();
          }
          setOpenRejectConfirmation(false);
        }}
      />
      <AuthorizeAction
        open={openConfirmConfirmation}
        allowedRoles={[1]}
        title={`Aceptar Contrato #${contractId}`}
        confirmButtonText={'Confirmar aceptacion'}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            // const { userId } = userAuthorizer;
            // voidSale(userId);
            confirmContract();
            setWasVoided(true);
            loadData();
          }
          setOpenConfirmConfirmation(false);
        }}
      />
    </Modal>
  )
}

export default ContractPreview;
