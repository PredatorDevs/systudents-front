import React, { useState, useEffect } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, PageHeader, Row, Input, Table, Modal, Radio, Space } from 'antd';
import { ArrowLeftOutlined, CloseOutlined, DeleteOutlined, LogoutOutlined, SaveOutlined, SaveTwoTone, SyncOutlined } from '@ant-design/icons';
import LocationSelector from '../../components/selectors/LocationSelector';
import { getUserLocation } from '../../utils/LocalData';
import ProductSearchForAdjustment from '../../components/ProductSearchForAdjustment';
import { forEach, isEmpty } from 'lodash';
import { customNot } from '../../utils/Notifications';
import { columnActionsDef, columnDef } from '../../utils/ColumnsDefinitions';
import { GIn2Icon, GInIcon, GOutIcon } from '../../utils/IconImageProvider';
import SaleDetailModel from '../../models/SaleDetail';
import productsServices from '../../services/ProductsServices';
import { validateSelectedData, validateStringData } from '../../utils/ValidateData';
import AuthorizeAction from '../../components/confirmations/AuthorizeAction';

const { Search } = Input;
const { confirm } = Modal;

function NewProductAdjustment() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [fetching, setFetching] = useState(false);
  const [openProductSearchForSale, setOpenProductSearchForSale] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [productSearchFilter, setProductSearchFilter] = useState('');

  const [locationSelected, setLocationSelected] = useState(getUserLocation());
  const [adjustmentType, setAdjustmentType] = useState(0);
  const [adjustmentComments, setAdjustmentComments] = useState("");

  const [docDetails, setDocDetails] = useState([]);

  useEffect(() => {

  }, []);
  
  useEffect(() => {
    if (state !== null) {
      // APPLY LOGIC FROM NAVIGATION PROPS
    }
  }, []);

  function getQuantitySumProductDetail(productId) {
    let sum = 0;
    forEach(docDetails, (x, index) => {
      sum += x.detailId === productId ? x.detailQuantity : 0;
    });
    return sum;
  }

  function pushDetail(data) {
    const newDetails = [ ...docDetails, data ];

    setDocDetails(newDetails);
  }

  const columns = [
    columnDef({title: 'Cantidad', dataKey: 'detailQuantity'}),
    columnDef({title: 'Detalle', dataKey: 'detailName'}),
    // columnMoneyDef({title: 'Precio Unitario', dataKey: (documentTypeSelected === 1 || documentTypeSelected === 2) ? 'detailUnitPrice' : 'detailUnitPriceWithoutTax'}),
    // columnMoneyDef({title: 'Exento', dataKey: 'detailNoTaxableTotal', showDefaultString: true}),
    // columnMoneyDef({title: 'Gravado', dataKey: (documentTypeSelected === 1 || documentTypeSelected === 2) ? 'detailTaxableTotal' : 'detailTaxableWithoutTaxesTotal', showDefaultString: true}),
    // columnMoneyDef({title: 'GravadoNoTaxes', dataKey: 'detailTaxableWithoutTaxesTotal', showDefaultString: true}),
    // columnMoneyDef({title: 'Taxes', dataKey: 'detailTotalTaxes', showDefaultString: true}),
    columnActionsDef(
      {
        title: 'Acciones',
        dataKey: 'uuid',
        detail: false,
        edit: false,
        del: true,
        delAction: (value) => {
          confirm({
            centered: true,
            title: '¿Desea eliminar este detalle?',
            icon: <DeleteOutlined />,
            content: 'Acción irreversible',
            okType: 'danger',
            onOk() { setDocDetails(docDetails.filter((x) => x.uuid !== value)); },
            onCancel() { },
          });
        },
      }
    ),
  ];

  function getPaymentTypeIcon(type, size = '36px') {
    switch(type) {
      case 1: return <GIn2Icon width={size} />;
      case 2: return <GOutIcon width={size} />;
      default: return <GInIcon width={size} />;
    }
  }

  function isValidDetail(element) {
    return (element.detailQuantity > 0) && (element.detailIsAvailable || adjustmentType === 1);
  }

  function validateData(detailsToValidate) {

    const validDocDetails = !isEmpty(detailsToValidate);
    const validDocDetailsIntegrity = detailsToValidate.every(isValidDetail);

    if (!validDocDetails) customNot('warning', 'Debe añadir por lo menos un detalle al ajuste', 'Dato no válido');
    if (!validDocDetailsIntegrity) customNot('warning', 'Los datos en el detalle no son admitidos', 'Dato no válido');
    return (
      validateSelectedData(adjustmentType, 'Seleccione un tipo de ajuste')
      && validateStringData(adjustmentComments, 'Especifique la razon del ajuste')
      && validDocDetails && validDocDetailsIntegrity
    );
  }

  async function checkDetailStockAvailability() {
    setFetching(true);
    let allStockAvailable = true;
    try {
      const checkedDetails = [];

      for await (const x of docDetails) {
        const quantityToCheck = getQuantitySumProductDetail(x.detailId);
        const availabilityRes = await productsServices.checkAvailability(locationSelected, x.detailId, quantityToCheck);
        const currentStock = availabilityRes.data[0].currentStock;

        if (availabilityRes.data[0].isAvailable === 1) {
          checkedDetails.push(new SaleDetailModel(
            x.detailId,
            x.detailName,
            x.detailIsTaxable,
            x.detailQuantity,
            x.detailUnitPrice,
            x.detailTaxesData,
            x.detailIsService,
            true
          ));
        } else {
          allStockAvailable = false;
          customNot('warning', `No hay suficientes existencias para despachar ${x.detailName}`, `Solamente hay ${currentStock} y usted está intentando añadir ${x.detailQuantity}`);

          checkedDetails.push(new SaleDetailModel(
            x.detailId,
            x.detailName,
            x.detailIsTaxable,
            x.detailQuantity,
            x.detailUnitPrice,
            x.detailTaxesData,
            x.detailIsService,
            false
          ));
        }
      }

      setDocDetails(checkedDetails);

      // Si todos los datos de venta están correctos pasa a lo siguiente
      if (validateData(checkedDetails)) {
        setOpenAuthModal(true);
      };
    } catch(error) {
      allStockAvailable = false;
      console.log(error);
    }

    setFetching(false);
    return allStockAvailable;
  }

  async function formAction() {
    if (adjustmentType === 2) {
      checkDetailStockAvailability();
    } else {
      // Si todos los datos de venta están correctos pasa a lo siguiente
      if (validateData(docDetails)) {
        setOpenAuthModal(true);
      };
    }
  }

  async function createNewAdjustment(idAuthorized) {
    setFetching(true);
    try {
      // START THE PROCESS OF SAVE THE SALE
      const res = await productsServices.stocks.adjustments.add(
        adjustmentComments,
        idAuthorized
      );

      const { insertId } = res.data;

      // EXPECTED req.body => bulkData = [[productStockAdjustmentId, productId, locationId, quantity, adjustmentType, comments]]
      const bulkData = docDetails.map((element) => ([ insertId, element.detailId, locationSelected, element.detailQuantity, adjustmentType, "" ]));

      const detRes = await productsServices.stocks.adjustments.addDetails(bulkData);
      // restoreState();

      // loadData();
      navigate('/main/inventory/products/adjustments');
      
      window.scrollTo(0, 0);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  return (
    <Wrapper>
      <PageHeader
        onBack={() => {
          navigate('/main/inventory/products/adjustments')
        }}
        backIcon={<ArrowLeftOutlined />}
        title={`Nuevo Ajuste de Inventario`}
        subTitle={``}
        style={{ margin: 0, marginBottom: 20, padding: 0 }}
        extra={[
          <Button
            id={'kardex-refresh-button'}
            icon={<SyncOutlined />}
            // onClick={() => generateKardexView()}
          >
            Actualizar
          </Button>
        ]}
      />
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={12}>
          <LocationSelector
            label={'Sucursal:'}
            onSelect={(value) => {
              setLocationSelected(value);
            }}
          />
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px' }}>{'Tipo de Ajuste:'}</p>
          <Space wrap>
            <Radio.Group
              buttonStyle="solid"
              value={adjustmentType}
              onChange={(e) => {
                setAdjustmentType(e.target.value);
              }}
            >
            {
              ([
                { id: 1, name: "Entrada" },
                { id: 2, name: "Salida" }
              ]).map((element) => {
                return (
                  <Radio.Button key={element.id} value={element.id}>
                    <Space>
                      {getPaymentTypeIcon(element.id, '16px')}
                      {element.name}
                    </Space>
                  </Radio.Button>
                )
              })
            }
            </Radio.Group>
          </Space>
        </Col>
        <Col span={24}>
          <p style={{ margin: '0px' }}>{'Razón de ajuste:'}</p>
          <Input 
            style={{ width: '100%' }} 
            placeholder={'Ej: Producto dañado'}
            value={adjustmentComments} 
            onChange={(e) => setAdjustmentComments(e.target.value)}
          />
        </Col>
        <Col span={24} style={{ display: adjustmentType !== 0 ? 'inline' : 'none' }}>
          <p style={{ margin: '0px' }}>{'Buscar producto:'}</p>
            <Search
              id={'newsale-product-search-input'}
              name={'filter'} 
              value={productSearchFilter} 
              placeholder="Código, Nombre, Cód. Barra"
              allowClear
              style={{ width: 300, marginBottom: 5 }}
              onChange={(e) => setProductSearchFilter(e.target.value)}
              onSearch={() => setOpenProductSearchForSale(true)}
              onKeyDown={
                (e) => {
                  if (e.key === 'Enter')
                    setOpenProductSearchForSale(true);
                }
              }
            />
        </Col>
        <Col span={24}>
          <Table 
            bordered
            loading={fetching}
            columns={columns}
            rowKey={'uuid'}
            size={'small'}
            dataSource={[
              ...docDetails
            ] || []}
            pagination={false}
            onRow={(record, index) => ({
              style: {
                background: record.detailIsAvailable ? 'inherit' : '#ffccc7',
                // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
              }
            })}
          />
        </Col>
        <Col span={8}>

        </Col>
        <Col span={8}>
          <Button
            type='primary'
            icon={<SaveOutlined />}
            style={{ width: '100%', marginBottom: 10 }}
            onClick={() => formAction()}
          >
            Efectuar Ajuste
          </Button>
          <Button
            icon={<CloseOutlined />}
            style={{ width: '100%' }}
            onClick={() => navigate('/main/inventory/products/adjustments')}
          >
            Cancelar
          </Button>
        </Col>
        <Col span={8}>

        </Col>
      </Row>
      <ProductSearchForAdjustment
        open={openProductSearchForSale} 
        priceScale={1}
        productFilterSearch={productSearchFilter}
        allowOutOfStock={adjustmentType === 1}
        onClose={(saleDetailToPush, executePush, currentStock) => { 
          setOpenProductSearchForSale(false);
          const { detailId, detailName, detailQuantity, detailIsService } = saleDetailToPush;
          const currentDetailQuantity = getQuantitySumProductDetail(detailId);
          if (executePush) {
            if (!(adjustmentType === 1)) {
              if (!(currentStock < (currentDetailQuantity + detailQuantity)) || detailIsService) {
                pushDetail(saleDetailToPush);
              } else {
                customNot(
                  'error',
                  `No puede añadir más ${detailName}`,
                  `Solo hay ${currentStock} y ya ha añadido ${currentDetailQuantity} por lo que no se pueden añadir ${detailQuantity} más`
                );
              }
            } else {
              pushDetail(saleDetailToPush);
            }
          }
          document.getElementById('newsale-product-search-input').focus();
          document.getElementById('newsale-product-search-input').select();
        }}
      />
      <AuthorizeAction
        open={openAuthModal}
        allowedRoles={[1, 2, 6]}
        title={`Ajuste de Inventario - ${adjustmentType === 1 ? 'Entrada' : 'Salida'}`}
        confirmButtonText={'Confirmar'}
        actionType={`Autorizó un ajuste de inventario de tipo ${adjustmentType === 1 ? 'Entrada' : 'Salida'}`}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            const { userId, roleId } = userAuthorizer;
            createNewAdjustment(userId);
          }
          setOpenAuthModal(false);
        }}
      />
    </Wrapper>
  );
}

export default NewProductAdjustment;
