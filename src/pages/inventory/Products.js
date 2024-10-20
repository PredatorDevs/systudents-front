import React, { useState, useEffect } from 'react';
import {
  Button,
  Col,
  Dropdown,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tooltip
} from 'antd';
import {
  ClearOutlined,
  DeleteTwoTone,
  DollarCircleTwoTone,
  EditTwoTone,
  FileExcelTwoTone,
  FilePdfTwoTone,
  FileTwoTone,
  MenuOutlined,
  PlusOutlined,
  SlidersTwoTone,
  StopTwoTone,
  SyncOutlined,
  WarningOutlined,
  WarningTwoTone
} from '@ant-design/icons';
import { find, includes } from 'lodash';

import productsServices from '../../services/ProductsServices.js';

import { Wrapper } from '../../styled-components/Wrapper';

import { filterData } from '../../utils/Filters';
import { columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../../utils/ColumnsDefinitions';
import ProductForm from '../../components/forms/ProductForm.js';
import { getUserLocation, getUserRole } from '../../utils/LocalData.js';
import categoriesServices from '../../services/CategoriesServices.js';
import brandsServices from '../../services/BrandsServices.js';
import locationsService from '../../services/LocationsServices.js';
import reportsServices from '../../services/ReportsServices.js';
import download from 'downloadjs';
import { customNot } from '../../utils/Notifications.js';
import ProductPricePreview from '../../components/previews/ProductPricePreview.js';
import LocationPicker from '../../components/pickers/LocationPicker.js';
import { useNavigate } from 'react-router-dom';
import AuthorizeAction from '../../components/confirmations/AuthorizeAction.js';

const { Search } = Input;
const { Option } = Select;

function Products() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');
  const [showProductsMinAlert, setShowProductMinAlert] = useState(false);
  const [openRemoveAuthConfirm, setOpenRemoveAuthConfirm] = useState(false);
  const [hideProductZeroStock, setHideProductZeroStock] = useState(false);
  const [openLocationPicker1, setOpenLocationPicker1] = useState(false);
  const [openLocationPicker2, setOpenLocationPicker2] = useState(false);

  const [openPricePreview, setOpenPricePreview] = useState(false);
  const [productIdSelected, setProductIdSelected] = useState(0);
  const [productIdToRemove, setProductIdToRemove] = useState(0);

  const [locationsData, setLocationsData] = useState([]);
  const [locationSelectedId, setLocationSelectedId] = useState(getUserLocation());

  const [categoriesData, setCategoriesData] = useState([]);
  const [categorySelectedId, setCategorySelectedId] = useState(0);

  const [brandsData, setBrandsData] = useState([]);
  const [brandSelectedId, setBrandSelectedId] = useState(0);

  const [openForm, setOpenForm] = useState(false);
  const [formUpdateMode, setFormUpdateMode] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [entityToUpdate, setEntityToUpdate] = useState({});

  async function loadData(locationId) {
    setFetching(true);
    try {
      const response = await productsServices.findByLocationStockData(locationId);
      setEntityData(response.data);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function loadGenData() {
    setFetching(true);
    try {
      const locRes = await locationsService.find();
      const catRes = await categoriesServices.find();
      const brandRes = await brandsServices.find();

      setLocationsData(locRes.data);
      setCategoriesData(catRes.data);
      setBrandsData(brandRes.data);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData(getUserLocation());
    loadGenData();
  }, []);

  async function fetchReportGeneralInventoryStock() {
    setFetching(true);
    try {
      const res = await reportsServices.getGeneralInventoryStock();
      /*
      const blob = res.data;
      const blobURL = URL.createObjectURL(blob);
      window.open(blobURL);
      */
      download(res.data, `ReporteInventario.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchReportGeneralInventory() {
    setFetching(true);
    try {
      const res = await reportsServices.getGeneralInventory();
      /*
      const blob = res.data;
      const blobURL = URL.createObjectURL(blob);
      window.open(blobURL);
      */
      download(res.data, `ReporteValorTotalInventario.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchReportByCategories() {
    setFetching(true);
    try {
      const res = await reportsServices.getLocationProductsByCategory(locationSelectedId);
      /*
      const blob = res.data;
      const blobURL = URL.createObjectURL(blob);
      window.open(blobURL);
      */
      download(res.data, `ProductosPorCategoria.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchReportByBrands() {
    setFetching(true);
    try {
      const res = await reportsServices.getLocationProductsByBrand(locationSelectedId);
      /*
      const blob = res.data;
      const blobURL = URL.createObjectURL(blob);
      window.open(blobURL);
      */
      download(res.data, `ProductosPorMarca.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchReportByFilteredData() {
    setFetching(true);
    try {
      const res = await reportsServices.getLocationProductsByFilteredData(
        filterData(
          entityData.filter(filterByFilters),
          filter,
          [
            'productId',
            'productName',
            'productName',
            'productCode',
            'productBarcode',
            'productBrandName',
            'productCategoryName',
            'productUbicationName'
          ]
        ) || []
      );
      /*
      const blob = res.data;
      const blobURL = URL.createObjectURL(blob);
      window.open(blobURL);
      */
      download(res.data, `ProductosPorFiltroPersonalizado.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchReportLowStockByLocation(locationId) {
    setFetching(true);
    try {
      const res = await reportsServices.getLowStockByLocation(
        locationId
      );
      download(res.data, `ReporteExistenciasBajas.pdf`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function fetchReportLowStockByLocationXLS(locationId) {
    setFetching(true);
    try {
      const res = await reportsServices.excel.getLowStockByLocation(
        locationId
      );
      download(res.data, `ReporteExistenciasBajas.xlsx`);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  function removeAction(nameToRemove, idToRemove) {
    Modal.confirm({
      title: '¿Desea deshabilitar este producto?',
      centered: true,
      icon: <WarningOutlined />,
      content: `${nameToRemove || 'Not defined'} será removido de la lista de productos`,
      okText: 'Confirmar',
      okType: 'danger',
      cancelText: 'Cancelar',
      async onOk() {
        setFetching(true);
        try {
          await productsServices.remove(idToRemove);
          setProductIdToRemove(0);
          loadData(locationSelectedId);
        } catch(error) {

        }
        setFetching(false);
      },
      onCancel() {},
    });
  }

  const columns = [
    columnDef({title: 'Id', dataKey: 'productId', fSize: 11}),
    columnDef({title: 'Cod', dataKey: 'productCode', fSize: 11}),
    columnIfValueEqualsTo({title: '', dataKey: 'productIsService', text: 'Servicio', valueToCompare: 1, color: 'blue'}),
    columnDef({title: 'Nombre', dataKey: 'productName', fSize: 11}),
    columnDef({title: 'Existencias', dataKey: 'currentLocationStock', fSize: 11}),
    columnDef({title: 'Contenido', dataKey: 'packageContent', fSize: 11}),
    {
      title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{'E. General'}</p>,
      dataIndex: 'productId',
      key: 'productId',
      align: 'left',
      render: (text, record, index) => {
        return (
          <p style={{ margin: '0px', fontSize: 11 }}>
            {Number(+record.currentLocationStock / +record.packageContent).toFixed(2)}
          </p>
        )
      }
    },
    columnDef({title: 'Categoria', dataKey: 'productCategoryName', fSize: 11}),
    columnDef({title: 'Marca', dataKey: 'productBrandName', fSize: 11}),
    columnDef({title: 'Medida Min.', dataKey: 'productMeasurementUnitName', fSize: 11}),
    columnMoneyDef({title: 'Costo', dataKey: 'productCost', fSize: 11}),
    columnMoneyDef({title: 'Costo + IVA', dataKey: 'productTotalCost', fSize: 11}),
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{''}</p>,
      dataIndex: 'productId',
      key: 'productId',
      align: 'right',
      render: (text, record, index) => {
        return (
          <Tooltip placement="left" title={`Producto con existencias bajas`}>
            <WarningTwoTone
              twoToneColor={'red'}
              style={{ display: (record.currentLocationStock <= record.currentLocationMinStockAlert) && record.productIsService === 0 ? 'inline' : 'none' }}
            />
          </Tooltip>
        )
      }
    },
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Acciones'}</p>,
      dataIndex: 'productId',
      key: 'productId',
      align: 'right',
      render: (text, record, index) => {
        return (
          // <Space size={'small'}>
          //   <Tooltip placement="left" title={`Editar`}>
          //     <Button
          //       onClick={(e) => {
                  
          //       }}
          //       size='small'
          //       icon={<EditTwoTone />}
          //     />
          //   </Tooltip>
          //   <Tooltip placement="top" title={`Ver precios`}>
          //     <Button
          //       onClick={(e) => {
          //         e.stopPropagation();
          //         setProductIdSelected(record.productId);
          //         setOpenPricePreview(true);
          //         // console.log(record);
          //       }}
          //       size='small'
          //       icon={<DollarCircleTwoTone twoToneColor={'#52c41a'} />}
          //     />
          //   </Tooltip>
          //   <Tooltip placement="top" title={`Kardex`}>
          //     <Button
          //       onClick={(e) => {
          //         e.stopPropagation();
          //         navigate(
          //           '/main/inventory/products/kardex',
          //           {
          //             state: {
          //               productId: record?.productId,
          //               productName: record?.productName,
          //               locationName: record?.locationName,
          //               initialStock: record?.currentLocationInitialStock,
          //               stock: record?.currentLocationStock,
          //               minStockAlert: record?.currentLocationMinStockAlert,
          //             }
          //           }
          //         );
          //       }}
          //       size='small'
          //       icon={<FileTwoTone twoToneColor={'#1677ff'} />}
          //     />
          //   </Tooltip>
          //   <Tooltip placement="top" title={`Deshabilitar`}>
          //     <Button
          //       onClick={(e) => {
          //         e.stopPropagation();
                  
          //       }}
          //       size='small'
          //       icon={<DeleteTwoTone twoToneColor={'#f5222d'} />}
          //     />
          //   </Tooltip>
          // </Space>
          <Dropdown
            menu={{
              items: [
                {
                  label: 'Editar',
                  key: '1',
                  icon: <EditTwoTone />,
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    if (includes([1, 2, 6, 7], getUserRole())) {
                      e.domEvent.preventDefault();
                      setOpenForm(true);
                      setFormUpdateMode(true);
                      setEntityToUpdate(find(entityData, ['productId', record?.productId]));
                    } else {
                      customNot('warning', 'No tienes permitido realizar esta acción')
                    }
                  }
                },
                {
                  label: 'Precios',
                  key: '2',
                  icon: <DollarCircleTwoTone twoToneColor={'#52c41a'} />,
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    setProductIdSelected(record.productId);
                    setOpenPricePreview(true);
                  }
                },
                {
                  label: 'Kardex',
                  key: '3',
                  icon: <FileTwoTone twoToneColor={'#1677ff'} />,
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    navigate(
                      '/main/inventory/products/kardex',
                      {
                        state: {
                          productId: record?.productId,
                          productName: record?.productName,
                          locationName: record?.locationName,
                          initialStock: record?.currentLocationInitialStock,
                          stock: record?.currentLocationStock,
                          minStockAlert: record?.currentLocationMinStockAlert,
                        }
                      }
                    );
                  }
                },
                {
                  label: 'Deshabilitar',
                  key: '4',
                  icon: <DeleteTwoTone twoToneColor={'#f5222d'} />,
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    setOpenRemoveAuthConfirm(true);
                    setProductIdToRemove(record.productId);
                  }
                },
              ]
            }}
            placement="bottomLeft"
          >
            <Button icon={<MenuOutlined />} size={'small'} onClick={(e) => {e.stopPropagation()}} />
          </Dropdown>
          // <Dropdown.Button
          //   size='small'
          //   style={{ margin: 0, padding: 0 }}
          //   icon={<MenuOutlined />}
          //   menu={{
          //     items: [
          //       {
          //         label: 'Editar',
          //         key: '1',
          //         icon: <EditTwoTone />,
          //       },
          //       {
          //         label: 'Precios',
          //         key: '2',
          //         icon: <DollarCircleTwoTone twoToneColor={'#52c41a'} />,
          //       },
          //       {
          //         label: 'Kardex',
          //         key: '3',
          //         icon: <FileTwoTone twoToneColor={'#1677ff'} />,
          //       },
          //       {
          //         label: 'Deshabilitar',
          //         key: '4',
          //         icon: <DeleteTwoTone twoToneColor={'#f5222d'} />,
          //       },
          //     ],
          //     onClick: (e) => {
          //       e.stopPropagation();
          //       switch(e.key) {
          //         case '1':
          //           console.log(1);
          //           break;
          //         case '2':
          //           break;
          //         case '3':
          //           break;
          //         case '4':
          //           break;
          //         default:
          //           break;
          //       }
          //     },
          //   }}
          //   // onClick={handleButtonClick}
          // />
        )
      }
    },
    // columnActionsDef(
    //   {
    //     title: 'Acciones',
    //     dataKey: 'productId',
    //     detail: false,
    //     // detailAction: (value) => customNot('info', 'En desarrollo', 'Próximamente'),
    //     edit: includes([1, 2, 3, 4], getUserRole()) && (getUserLocation() === 1),
    //     editAction: (value) => {
    //       setOpenForm(true);
    //       setFormUpdateMode(true);
    //       setEntityToUpdate(find(entityData, ['productId', value]));
    //     },
    //   }
    // ),
  ];

  function filterByFilters(x) {
    return (
      ((x.productCategoryId === categorySelectedId) || categorySelectedId === 0)
      && ((x.productBrandId === brandSelectedId) || brandSelectedId === 0)
      && ((+x.currentLocationStock <= +x.currentLocationMinStockAlert) || showProductsMinAlert === false)
      && ((+x.currentLocationStock !== 0) || hideProductZeroStock === false)
    )
  }

  return (
    <Wrapper applyPadding applyBorderRadius backgroundColor={'#f0f5ff'}>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEntityToUpdate({});
                setOpenForm(true);
              }}
              loading={fetching}
            >
              Nuevo producto
            </Button>
            <Button 
              icon={<ClearOutlined />} 
              onClick={(e) => {
                setFilter('');
                setCategorySelectedId(0);
                setBrandSelectedId(0);
              }} 
              loading={fetching}
            >
              Limpiar filtros
            </Button>
            {/* <Button 
              icon={<SlidersTwoTone />} 
              onClick={(e) => {
                if (includes([1, 2, 6], getUserRole())) {
                  e.preventDefault();
                  navigate('/main/inventory/products/adjustments');
                } else {
                  customNot('warning', 'No tienes permitido realizar esta acción', '')
                }
              }} 
              loading={fetching}
            >
              Ajustes de Existencias
            </Button>
            <Button
              icon={<StopTwoTone twoToneColor={'#fa541c'} />} 
              onClick={(e) => {
                if (includes([1, 2, 6], getUserRole())) {
                  e.preventDefault();
                  navigate('/main/inventory/products/deactivated');
                } else {
                  customNot('warning', 'No tienes permitido realizar esta acción', '')
                }
              }} 
              loading={fetching}
            >
              Ver Deshabilitados
            </Button> */}
            <Button 
              icon={<SyncOutlined />} 
              onClick={(e) => loadData(locationSelectedId)} 
              loading={fetching}
            >
              Actualizar
            </Button>
          </Space>
        </Col>
        <Col span={24} style={{
          backgroundColor: '#f0f0f0',
          border: '1px solid #bfbfbf',
          borderRadius: 5,
          paddingTop: 5,
          paddingLeft: 5,
          paddingRight: 5,
          paddingBottom: 5,
        }}>
          <p style={{ margin: 0, color: '#595959', fontWeight: 600 }}>Reportería:</p>
          <Space wrap>
            <Button 
              icon={<FilePdfTwoTone twoToneColor={'green'} />} 
              onClick={(e) => {
                fetchReportGeneralInventoryStock();
              }}
              loading={fetching}
            >
              General
            </Button>
            <Button 
              icon={<FilePdfTwoTone twoToneColor={'red'} />}
              onClick={() => fetchReportByCategories()}
              loading={fetching}
            >
              Por categoria
            </Button>
            <Button 
              icon={<FilePdfTwoTone twoToneColor={'blue'} />} 
              onClick={() => fetchReportByBrands()}
              loading={fetching}
            >
              Por marca
            </Button>
            <Button 
              icon={<FilePdfTwoTone twoToneColor={'purple'} />} 
              onClick={() => fetchReportByFilteredData()}
              loading={fetching}
            >
              Por filtros
            </Button>
            <Button 
              icon={<FilePdfTwoTone twoToneColor={'red'} />} 
              onClick={() => {
                fetchReportGeneralInventory();
              }}
              loading={fetching}
            >
              Valores Existencias
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    label: 'PDF',
                    key: '1',
                    icon: <FilePdfTwoTone twoToneColor={'#f5222d'} />,
                    onClick: (e) => {
                      setOpenLocationPicker1(true);
                    }
                  },
                  {
                    label: 'EXCEL',
                    key: '2',
                    icon: <FileExcelTwoTone twoToneColor={'#52c41a'} />,
                    onClick: (e) => {
                      setOpenLocationPicker2(true);
                    }
                  }
                ]
              }}
              placement="bottomLeft"
            >
              <Button icon={<FileTwoTone twoToneColor={'#1677ff'} />} onClick={(e) => {e.stopPropagation()}}>
                Existencias bajas
              </Button>
            </Dropdown>
          </Space>
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Sucursal:</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={locationSelectedId} 
            onChange={(value) => {
              setLocationSelectedId(value);
              loadData(value);
            }}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0} disabled>{'Seleccione sucursal'}</Option>
            {
              (locationsData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Nombre:</p>
          <Search
            name={'filter'} 
            value={filter} 
            placeholder="Producto 1" 
            allowClear 
            style={{ width: 300 }}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Categoría:</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={categorySelectedId} 
            onChange={(value) => setCategorySelectedId(value)}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0}>{'TODAS'}</Option>
            {
              (categoriesData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Marca:</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={brandSelectedId} 
            onChange={(value) => setBrandSelectedId(value)}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0}>{'TODAS'}</Option>
            {
              (brandsData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Mostrar existencias bajas:</p>
          <Switch
            checked={showProductsMinAlert}
            onChange={(checked) => {
              setShowProductMinAlert(checked);
            }}
            size='small'
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Ocultar existencias cero:</p>
          <Switch
            checked={hideProductZeroStock}
            onChange={(checked) => {
              setHideProductZeroStock(checked);
            }}
            size='small'
          />
        </Col>
        <Col span={24} style={{ overflowX: 'scroll' }}>
          <Table 
            size='small'
            style={{ width: '100%' }}
            rowKey={'productId'}
            loading={fetching}
            dataSource={
              filterData(
                entityData.filter(filterByFilters),
                filter,
                [
                  'productId',
                  'productName',
                  'productCode',
                  'productBarcode',
                  'productBrandName',
                  'productCategoryName',
                  'productUbicationName'
                ]
              ) || []
            }
            columns={columns}
            onRow={(record, rowIndex) => {
              return {
                onClick: (e) => {
                  if (includes([1, 2, 6, 7], getUserRole())) {
                    e.preventDefault();
                    setOpenForm(true);
                    setFormUpdateMode(true);
                    setEntityToUpdate(find(entityData, ['productId', record?.productId]));
                  } else {
                    customNot('warning', 'No tienes permitido realizar esta acción')
                  }
                }
              };
            }}
          />
        </Col>
      </Row>
      <ProductForm
        open={openForm} 
        updateMode={formUpdateMode} 
        dataToUpdate={entityToUpdate} 
        onClose={(refresh) => { 
          setOpenForm(false);
          setFormUpdateMode(false);
          setEntityToUpdate({});
          if (refresh) { 
            loadData(locationSelectedId);
          }
        }}
      />
      <ProductPricePreview
        open={openPricePreview}
        productId={productIdSelected || 0}
        onClose={() => {
          setOpenPricePreview(false);
          setProductIdSelected(0);
        }}
      />
      <LocationPicker
        open={openLocationPicker1}
        onClose={() => setOpenLocationPicker1(false)}
        onSelect={(value) => {
          fetchReportLowStockByLocation(value);
        }}
        showAllOption={true}
      />
      <LocationPicker
        open={openLocationPicker2}
        onClose={() => setOpenLocationPicker2(false)}
        onSelect={(value) => {
          fetchReportLowStockByLocationXLS(value);
        }}
        showAllOption={true}
      />
      <AuthorizeAction
        open={openRemoveAuthConfirm}
        allowedRoles={[1, 2, 6]}
        title={`Autorizar Remover Item de Lista Activa`}
        confirmButtonText={'Confirmar Remover Producto'}
        actionType={'Remover item de la lista de inventario activo'}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized && successAuth) {
            // const { userId } = userAuthorizer;
            removeAction('', productIdToRemove);
          }
          setOpenRemoveAuthConfirm(false);
        }}
      />
    </Wrapper>
  );
}

export default Products;
