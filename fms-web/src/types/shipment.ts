export interface Shipment {
  shipment_id: number;
  shipment_no: string;
  transport_mode: 'SEA' | 'AIR';
  trade_type: 'EXPORT' | 'IMPORT';
  service_type: string;
  incoterms: string;
  customer_name: string;
  shipper_name: string;
  consignee_name: string;
  carrier_name: string;
  origin_port: string;
  dest_port: string;
  etd: string;
  eta: string;
  total_pkg_qty: number;
  pkg_type: string;
  gross_weight: number;
  volume_cbm: number;
  status: 'PENDING' | 'BOOKED' | 'SHIPPED' | 'DEPARTED' | 'ARRIVED' | 'DELIVERED';
  created_at: string;
}

export interface ShipmentFormData {
  transport_mode: 'SEA' | 'AIR';
  trade_type: 'EXPORT' | 'IMPORT';
  service_type: string;
  incoterms: string;
  customer_id: number;
  shipper_id: number;
  consignee_id: number;
  carrier_id: number;
  origin_port: string;
  dest_port: string;
  etd: string;
  eta: string;
  total_pkg_qty: number;
  pkg_type: string;
  gross_weight: number;
  volume_cbm: number;
  declared_value: number;
  currency: string;
}

export interface Customer {
  customer_id: number;
  customer_cd: string;
  customer_name: string;
  customer_type: string;
}

export interface Carrier {
  carrier_id: number;
  carrier_cd: string;
  carrier_name: string;
  carrier_type: 'SEA' | 'AIR';
}

export interface Port {
  port_cd: string;
  port_name: string;
  country_cd: string;
  port_type: 'SEA' | 'AIR';
}
