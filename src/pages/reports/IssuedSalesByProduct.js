import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button, Col, Input, PageHeader, Row, Space, Table, Tooltip } from 'antd';

// import 'moment/locale/es-mx';
// import locale from 'antd/es/date-picker/locale/es_ES';
// import moment from 'moment';
import { ExperimentTwoTone, FileExcelTwoTone, FilePdfTwoTone, FileSearchOutlined, InfoCircleTwoTone, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { forEach, isEmpty } from 'lodash';
import { columnActionsDef, columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../../utils/ColumnsDefinitions';
import { validateStringData } from '../../utils/ValidateData';
import salesServices from '../../services/SalesServices';
import SalePreview from '../../components/previews/SalePreview';
import download from 'downloadjs';
// moment.updateLocale('es-mx', { week: { dow: 1 }});

function IssuedSalesByProduct() {
  // const navigate = useNavigate();

  const [fetching, setFetching] = useState();
  const [openPreview, setOpenPreview] = useState(false);
  const [productIdentifier, setProductIdentifier] = useState('');

  const [entitydata, setEntityData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);


  useEffect(() => {
  }, []);

  async function searchAction() {
    setFetching(true);
    try {
      const res = await salesServices.findByProductIdentifier(productIdentifier);
      setEntityData(res.data);
      document.getElementById('g-sale-doc-number-input').focus();
      document.getElementById('g-sale-doc-number-input').select();
    } catch(err) {
    
    }
    setFetching(false);
  }

  async function fetchPDFReport() {
    setFetching(true);
    try {
      const res = await salesServices.pdfDocs.findByProductIdentifier(productIdentifier);
      download(res.data, `ReporteVentasEmitidasPorProducto.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchExcelReport() {
    setFetching(true);
    try {
      const res = await salesServices.excelDocs.findByProductIdentifier(productIdentifier);
      download(res.data, `ReporteVentasEmitidasPorProducto.xlsx`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  function getDataSumByProperty(propertyName) {
    let total = 0;
    forEach(entitydata, (value) => {
      total += +(value?.[propertyName] || 0)
    })
    return total.toFixed(2);
  }

  return (
    <Row gutter={[16, 16]} style={{ width: '100%' }}>
      <Col span={24}>
        <PageHeader
          onBack={() => null}
          backIcon={<FileSearchOutlined />}
          title={`Ventas Emitidas`}
          subTitle={<p style={{ margin: 0 }}>{`Búsqueda por Producto`} <Tooltip title="Busca ventas que incluyan el producto en su detalle"><InfoCircleTwoTone style={{ marginLeft: 5, fontSize: '16px' }} /></Tooltip></p>}
          extra={[
            <Button
              icon={<FileExcelTwoTone twoToneColor={'#52c41a'} />}
              onClick={() => {
                // loadData();
                fetchExcelReport();
              }}
              loading={fetching}
              disabled={isEmpty(entitydata)}
            >
              Generar Excel
            </Button>,
            <Button
              icon={<FilePdfTwoTone twoToneColor={'#f5222d'} />}
              onClick={() => {
                // loadData();
                fetchPDFReport();
              }}
              disabled={isEmpty(entitydata)}
            >
              Generar PDF
            </Button>
          ]}
        />
      </Col>
      <Col span={24}>
        <p style={{ margin: 0, fontSize: 10, color: '#8c8c8c' }}>Parámetros de búsqueda:</p>
        <p style={{ margin: 0, marginBottom: 5, fontSize: 12, color: '#434343' }}>Id - Codigo</p>
        <Space>
          <Input 
            id='g-sale-doc-number-input'
            style={{ width: '100%' }} 
            placeholder={'Código o Id de Producto'}
            value={productIdentifier} 
            onChange={(e) => setProductIdentifier(e.target.value)}
            // onBlur={(e) => { validateDocNumber(); }}
            onKeyDown={
              (e) => {
                if (e.key === 'Enter')
                  if (validateStringData(productIdentifier, 'Ingrese un numero de correlativo')) {
                    searchAction();
                  }
              }
            }
          />
          <Button
            icon={<SearchOutlined />}
            loading={fetching}
            onClick={() => {
              searchAction();
            }}
          >
            Buscar
          </Button>
        </Space>
      </Col>
      <Col span={24}>
        <Table 
          loading={fetching}
          size='small'
          style={{ width: '100%' }}
          rowKey={'rowNum'}
          dataSource={[...entitydata, { customerFullname: 'TOTAL', total: getDataSumByProperty('total'), saleTotalPaid: getDataSumByProperty('saleTotalPaid') }] || []}
          columns= {[
            // columnDef({title: 'Id', dataKey: 'id'}),
            columnDef({title: 'Código', dataKey: 'id'}),
            columnDef({title: 'Tipo', dataKey: 'documentTypeName'}),
            columnDef({title: 'N° Doc', dataKey: 'docNumber', ifNull: '-'}),
            columnDef({title: 'Fecha', dataKey: 'docDatetime'}),
            columnDef({title: 'Cliente', dataKey: 'customerFullname'}),
            // columnDef({title: 'Sucursal', dataKey: 'locationName'}),
            columnDef({title: 'Pago', dataKey: 'paymentTypeName'}),
            columnIfValueEqualsTo({title: '', dataKey: 'isVoided', text: 'Anulada', valueToCompare: 1 }),
            // columnDef({title: 'Anulada', dataKey: 'isVoided'}),
            columnMoneyDef({title: 'Total', dataKey: 'total', showDefaultString: true }),
            columnMoneyDef({title: 'Pagado', dataKey: 'saleTotalPaid'}),
            columnActionsDef(
              {
                title: 'Acciones',
                dataKey: 'id',
                edit: false,
                detailAction: (value) => {
                  setEntitySelectedId(value);
                  setOpenPreview(true);
                },
              }
            ),
          ]}
          onRow={(record, rowIndex) => {
            return {
              onClick: (e) => {
                e.preventDefault();
                setEntitySelectedId(record.id);
                setOpenPreview(true);
              }
            };
          }}
          // pagination={{ defaultPageSize: 200, showSizeChanger: true, pageSizeOptions: ['10', '50', '100'] }}
          pagination={false}
        />
      </Col>
      <SalePreview
        open={openPreview}
        saleId={entitySelectedId}
        allowActions={true}
        onClose={(wasVoided) => {
          setOpenPreview(false);
        }}
      />
    </Row>
  );
}

export default IssuedSalesByProduct;
