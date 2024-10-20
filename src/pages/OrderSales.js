// import { Col, Row, Button, Table, Space } from 'antd';
// import React, { useState, useEffect, useRef } from 'react';
// import styled from 'styled-components';
// import { Wrapper } from '../styled-components/Wrapper';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { BookOutlined, LogoutOutlined, SnippetsOutlined } from '@ant-design/icons';
// import { TableContainer } from '../styled-components/TableContainer';
// import { columnActionsDef, columnBtnAction, columnDef, columnMoneyDef } from '../utils/ColumnsDefinitions';
// import { customNot } from '../utils/Notifications';
// import { CompanyInformation } from '../styled-components/CompanyInformation';
// import SalePreview from '../components/previews/SalePreview';
// import orderSalesServices from '../services/OrderSalesServices';
// import { useReactToPrint } from 'react-to-print';
// import OrderSaleTicket from '../components/tickets/OrderSaleTicket';
// import OrderSalePreview from '../components/previews/OrderSalePreview';
// import OrderSaleForm from '../components/forms/OrderSaleForm';
// import { includes } from 'lodash';
// import { getUserLocation, getUserRole } from '../utils/LocalData';

// const Container = styled.div`
//   /* align-items: center; */
//   background-color: #325696;
//   border: 1px solid #D1DCF0;
//   border-radius: 10px;
//   display: flex;
//   flex-direction: column;
//   padding: 20px;
//   width: 100%;
//   .ant-card:hover {
//     cursor: pointer;
//   }
//   .card-title {
//     font-size: 15px;
//     color: #223B66;
//     text-overflow: ellipsis;
//     /* background-color: red; */
//     font-weight: 600;
//     margin: 0px;
//     overflow: hidden;
//     white-space: nowrap;
//     width: 100%;
//   }
// `;

// function OrderSales() {
//   const [fetching, setFetching] = useState(false);
//   const [entityRefreshData, setEntityRefreshData] = useState(0);

//   const [entityData, setEntityData] = useState([]);
//   const [openPreview, setOpenPreview] = useState(false);
//   const [openForm, setOpenForm] = useState(false);
//   const [entitySelectedId, setEntitySelectedId] = useState(0);

//   const navigate = useNavigate();

//   function loadData(){
//     setFetching(true);
//     orderSalesServices.findByLocationCurrentActiveShiftcut(getUserLocation())
//     .then((response) => {
//       setEntityData(response.data);
//       setFetching(false);
//     })
//     .catch((error) => {
//       customNot('error', 'Sin información', 'Revise su conexión a la red');
//       setFetching(false);
//     });
//   }

//   useEffect(() => {
//     loadData();
//   }, [ entityRefreshData ]);

//   const componentRef = useRef();

//   const handlePrint = useReactToPrint({
//     content: () => componentRef.current,
//   });

//   const columns = [
//     columnDef({title: 'Código', dataKey: 'id'}),
//     columnDef({title: 'Fecha', dataKey: 'docDatetime'}),
//     columnDef({title: 'Cliente', dataKey: 'customerFullname'}),
//     // columnDef({title: 'Sucursal', dataKey: 'locationName'}),
//     columnDef({title: 'Tipo', dataKey: 'docTypeName'}),
//     columnDef({title: 'Estado', dataKey: 'statusName'}),
//     columnMoneyDef({title: 'Total', dataKey: 'total'}),
//     {
//       title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Opciones'}</p>,
//       dataIndex: 'id',
//       key: 'id',
//       align: 'right',
//       render: (text, record, index) => {
//         return (
//           <Space>
//             {
//               includes([1, 2, 3, 4], getUserRole()) ? 
//               <Button
//                 type="primary"
//                 size="small"
//                 style={{ fontSize: 10, backgroundColor: '#1890ff', borderColor: '#1890ff', display: (record.status === 1) ? 'inline-block' : 'none' }}
//                 onClick={() => { navigate('/sales/new', { state: { orderSaleId: record.id } })}}
//               >
//                 {'Despachar'}
//               </Button>
//                : <>
              
//               </>
//             }
//           </Space>
//         )
//       }
//     },
//     columnActionsDef(
//       {
//         title: 'Acciones',
//         dataKey: 'id',
//         detailAction: (value) => {
//           setEntitySelectedId(value);
//           setOpenPreview(true);
//         },
//         editAction: (value) => {
//           setEntitySelectedId(value);
//           setOpenForm(true);
//         }
//       }
//     ),
//   ];

//   return (
//     <Wrapper xCenter yCenter>
//       <CompanyInformation>
//         <section className='company-info-container'>
//           <p className='module-name'>Pedidos</p>
//         </section>
//       </CompanyInformation>
//       <Container>
//         <Row gutter={[8, 8]}>
//           <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 12 }} xl={{ span: 12 }} xxl={{ span: 12 }}>
//             <p style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 600 }}>Resumen</p>
//           </Col>
//           <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 12 }} xl={{ span: 12 }} xxl={{ span: 12 }}>
//             <Space>
//               <Button 
//                 type={'primary'} 
//                 icon={<BookOutlined />}
//                 onClick={() => navigate('/ordersales/new')}
//                 size={'large'}
//                 >
//                 Nuevo pedido
//               </Button>
//               <div style={{ width: '10px' }} />
//               <Button 
//                 // type={'primary'} 
//                 icon={<SnippetsOutlined />}
//                 onClick={() => navigate('/reports/ordersales/binnacles')}
//                 size={'large'}
//               >
//                 Bitácora
//               </Button>
//               <div style={{ width: '10px' }} />
//               <Button 
//                 type={'primary'} 
//                 icon={<LogoutOutlined />}
//                 onClick={() => navigate('/main')}
//                 size={'large'}
//                 danger
//                 >
//                 Salir
//               </Button>
//             </Space>
//           </Col>
//         </Row>
//       </Container>
//       <TableContainer>
//         <p style={{ color: '#FFFFFF', marginTop: 10, fontSize: 18 }}>Recientes</p>
//         <Table 
//           columns={columns}
//           rowKey={'id'}
//           size={'small'}
//           dataSource={entityData || []}
//         />
//       </TableContainer>
//       <CompanyInformation>
//         <section className='company-info-container'>
//           <p className='module-description'>SigPro COM</p>
//           <p className='module-description'>&copy; Todos los derechos reservados 2022</p>
//         </section>
//       </CompanyInformation>
//       <OrderSalePreview
//         open={openPreview}
//         orderSaleId={entitySelectedId}
//         onClose={() => setOpenPreview(false)}
//       />
//       <OrderSaleForm
//         open={openForm}
//         orderSaleId={entitySelectedId}
//         onRefresh={() => loadData()}
//         onClose={() => setOpenForm(false)}
//       />
//     </Wrapper>
//   );
// }

// export default OrderSales;

import { Col, Row, Button, Table, Space, Statistic, Card, Result, Tooltip, Tag, Modal } from 'antd';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Wrapper } from '../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, DollarOutlined, FileOutlined, LogoutOutlined, PlusOutlined, SyncOutlined, WarningFilled } from '@ant-design/icons';
import { TableContainer } from '../styled-components/TableContainer';
import { columnActionsDef, columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../utils/ColumnsDefinitions';
import { customNot } from '../utils/Notifications';
import { CompanyInformation } from '../styled-components/CompanyInformation';
import salesServices from '../services/SalesServices.js';
import SalePreview from '../components/previews/SalePreview';
import { getUserLocation, getUserMyCashier } from '../utils/LocalData';
import generalsServices from '../services/GeneralsServices';
import { forEach } from 'lodash';
import cashiersServices from '../services/CashiersServices';
import orderSalesServices from '../services/OrderSalesServices.js';
import OrderSalePreview from '../components/previews/OrderSalePreview.js';
import { GRestoreIcon } from '../utils/IconImageProvider.js';

const { confirm } = Modal;

function OrderSales() {
  const [fetching, setFetching] = useState(false);
  const [ableToProcess, setAbleToProcess] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [entitySelectedId, setEntitySelectedId] = useState(0);

  const navigate = useNavigate();

  // async function checkIfAbleToProcess() {
  //   setFetching(true);

  //   const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());

  //   const { isOpen, currentShiftcutId } = response.data[0];

  //   if (isOpen === 1 && currentShiftcutId !== null) {
  //     setAbleToProcess(true);
  //   }

  //   setFetching(false);
  // }

  async function loadData() {
    setFetching(true);
    const response = await orderSalesServices.find();
    console.log(response.data);
    setEntityData(response.data);
    setFetching(false);
  }

  useEffect(() => {
    // checkIfAbleToProcess();
    loadData();
  }, []);

  const columns = [
    // columnDef({title: 'Id', dataKey: 'id'}),
    columnDef({title: 'Código', dataKey: 'id'}),
    columnDef({title: 'Tipo', dataKey: 'documentTypeName'}),
    // columnDef({title: 'N° Doc', dataKey: 'docNumber', ifNull: '-'}),
    columnDef({title: 'Fecha', dataKey: 'documentDatetime'}),
    columnDef({title: 'Cliente', dataKey: 'customerFullname'}),
    // columnDef({title: 'Sucursal', dataKey: 'locationName'}),
    columnDef({title: 'Pago', dataKey: 'paymentTypeName'}),
    // columnIfValueEqualsTo({title: '', dataKey: 'isVoided', text: 'Anulada', valueToCompare: 1 }),
    {
      title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Estado'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (text, record, index) => {
        return (
          <Tag color={`${record.statusColor}`}>{`${record.statusName}`}</Tag>
          )
        }
      },
    // columnDef({title: 'Anulada', dataKey: 'isVoided'}),
    columnMoneyDef({title: 'Total', dataKey: 'total'}),
    // columnMoneyDef({title: 'Pagado', dataKey: 'saleTotalPaid'}),
    {
      title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'Acciones'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'right',
      render: (text, record, index) => {
        return (
          <Space style={{ display: record.status === 1 ? 'flex' : 'none', flexDirection: 'row', justifyContent: 'flex-end' }} size={'small'}>
            {/* <Tooltip placement="left" title={`Reincorporar`}> */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/main/sales/new', { state: { orderSaleId: record.id } })
                }}
                // size='small'
              >
                Facturar
              </Button>
            {/* </Tooltip> */}
            {/* <Tooltip placement="left" title={``}> */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  confirm({
                    title: `¿Está seguro de que desea descartar Orden de Venta No ${record.id}?`,
                    icon: <WarningFilled />,
                    content: `Se descartara y no podrá ser facturada `,
                    okText: 'CONFIRMAR',
                    cancelText: 'Cancelar',
                    async onOk() {
                      setFetching(true);
                      try {
                        const res = await orderSalesServices.changeStatus(3, record.id);
                        customNot('success', 'Orden de venta fue descartada con exito', 'Acción terminada');
                        loadData();
                      } catch(error) {
                        
                      }
                      setFetching(false);
                    },
                    onCancel() {},
                  });
                }}
                // size='small'
              >
                Descartar
              </Button>
            {/* </Tooltip> */}
          </Space>
        )
      }
    }
  ];

  function getCashSaleTotal() {
    let total = 0;
    forEach(entityData, (value) => {
      total += +value.saleTotalPaid
    });
    return total || 0;
  }

  function getCreditSaleTotal() {
    let total = 0;
    forEach(entityData, (value) => {
      total += (+value.total - +value.saleTotalPaid)
    });
    return total || 0;
  }

  return (
    // !ableToProcess ? <>
    //   <Result
    //     status="info"
    //     title={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando..." : "Caja cerrada, operaciones de venta limitadas"}`}</p>}
    //     subTitle={<p style={{ color: '#434343' }}>{`${fetching ? "Por favor espere..." : "Usted debe aperturar un nuevo turno en su caja para poder procesar"}`}</p>}
    //   />
    // </> :
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <Button 
              icon={<SyncOutlined />}
              onClick={() => loadData()}
              // size={'large'}
              >
              Actualizar
            </Button>
          </Space>
        </Col>
        <Col span={24} style={{ backgroundColor: '#FAFAFA' }}>
          <Space wrap>
            <Card style={{ margin: '10px 5px' }}>
              <Statistic loading={fetching} title="Ordenes de Ventas" value={entityData.length} prefix={<BookOutlined />} />
            </Card>
            {/* <Card style={{ margin: '10px 5px' }}>
              <Statistic loading={fetching} title="Total Contado" value={getCashSaleTotal()} precision={2} prefix={<DollarOutlined />} />
            </Card>
            <Card style={{ margin: '10px 5px' }}>
              <Statistic loading={fetching} title="Total Crédito" value={getCreditSaleTotal()} precision={2} prefix={<DollarOutlined />} />
            </Card> */}
          </Space>
        </Col>
        <Col span={24}>
          <p style={{ fontWeight: 600, margin: '10px 0px 5px 0px' }}>Ventas del turno actual</p>
        </Col>
        <Col span={24}>
          <Table 
            columns={columns}
            rowKey={'id'}
            size={'small'}
            dataSource={entityData || []}
            loading={fetching}
            onRow={(record, rowIndex) => {
              return {
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEntitySelectedId(record.id);
                  setOpenPreview(true);
                }
              };
            }}
          />
        </Col>
      </Row>
      <OrderSalePreview
        open={openPreview}
        orderSaleId={entitySelectedId}
        onClose={(wasVoided) => {
          setOpenPreview(false);
          if (wasVoided) loadData();
        }}
      />
    </Wrapper>
  );
}

export default OrderSales;
