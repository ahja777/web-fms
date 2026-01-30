-- ============================================================================
-- FMS Database Schema - 07. Customs (통관)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 통관 요청 (Customs Request)
-- ----------------------------------------------------------------------------
CREATE TABLE CUS_CUSTOMS_REQUEST (
    CUSTOMS_REQUEST_ID  BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CUSTOMS_REQUEST_NO  VARCHAR(30)     UNIQUE NOT NULL,    -- 통관요청번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    HBL_ID              BIGINT,                             -- HBL
    HAWB_ID             BIGINT,                             -- HAWB
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 통관 유형
    CUSTOMS_TYPE_CD     VARCHAR(20)     NOT NULL,           -- 통관유형 (EXPORT/IMPORT)
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드

    -- 관세사 정보
    BROKER_ID           BIGINT,                             -- 관세사
    BROKER_REF_NO       VARCHAR(50),                        -- 관세사참조번호

    -- 신고 정보
    DECLARATION_TYPE_CD VARCHAR(20),                        -- 신고유형 (일반/간이/목록통관 등)
    BL_NO               VARCHAR(30),                        -- B/L 번호
    AWB_NO              VARCHAR(15),                        -- AWB 번호

    -- 화물 정보
    COMMODITY_DESC      VARCHAR(1000),                      -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량

    -- 금액 정보
    INVOICE_AMT         DECIMAL(18,2),                      -- 송장금액
    INVOICE_CURR        CHAR(3),                            -- 송장통화
    EXCHANGE_RATE       DECIMAL(18,6),                      -- 환율
    CIF_VALUE           DECIMAL(18,2),                      -- CIF 가격
    CIF_VALUE_KRW       DECIMAL(18,2),                      -- CIF 가격 (원화)

    -- 세금 정보 (예상)
    EST_DUTY_AMT        DECIMAL(18,2),                      -- 예상관세
    EST_VAT_AMT         DECIMAL(18,2),                      -- 예상부가세
    EST_TOTAL_TAX_AMT   DECIMAL(18,2),                      -- 예상총세금

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'REQUESTED', -- 상태
    REQUEST_DTM         DATETIME,                           -- 요청일시
    ACCEPT_DTM          DATETIME,                           -- 접수일시
    COMPLETE_DTM        DATETIME,                           -- 완료일시

    -- 첨부서류
    CI_ATTACHED_YN      CHAR(1)         DEFAULT 'N',        -- C/I 첨부여부
    PL_ATTACHED_YN      CHAR(1)         DEFAULT 'N',        -- P/L 첨부여부
    BL_ATTACHED_YN      CHAR(1)         DEFAULT 'N',        -- B/L 첨부여부

    SPECIAL_INST        VARCHAR(1000),                      -- 특별지시사항
    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID),
    FOREIGN KEY (BROKER_ID) REFERENCES MST_CUSTOMS_BROKER(BROKER_ID)
);

COMMENT ON TABLE CUS_CUSTOMS_REQUEST IS '통관 요청';

-- ----------------------------------------------------------------------------
-- 7.2 수출신고서 (Export Declaration)
-- ----------------------------------------------------------------------------
CREATE TABLE CUS_EXPORT_DECLARATION (
    EXPORT_DECL_ID      BIGINT          PRIMARY KEY AUTO_INCREMENT,
    EXPORT_DECL_NO      VARCHAR(30)     UNIQUE NOT NULL,    -- 수출신고번호

    -- 연결 정보
    CUSTOMS_REQUEST_ID  BIGINT,                             -- 통관요청
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주
    BROKER_ID           BIGINT,                             -- 관세사

    -- 신고 정보
    CUSTOMS_OFFICE_CD   VARCHAR(10),                        -- 신고세관
    DECLARATION_DT      DATE,                               -- 신고일자
    ACCEPT_NO           VARCHAR(30),                        -- 수리번호
    ACCEPT_DT           DATE,                               -- 수리일자

    -- 수출자 정보
    EXPORTER_NM         VARCHAR(200),                       -- 수출자명
    EXPORTER_BIZ_NO     VARCHAR(20),                        -- 수출자사업자번호
    EXPORTER_ADDR       VARCHAR(500),                       -- 수출자주소

    -- 수하인 정보
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인명
    CONSIGNEE_COUNTRY   CHAR(2),                            -- 수하인국가
    CONSIGNEE_ADDR      VARCHAR(500),                       -- 수하인주소

    -- 운송 정보
    LOAD_PORT_CD        VARCHAR(10),                        -- 적재항
    DEST_PORT_CD        VARCHAR(10),                        -- 도착항
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드
    BL_NO               VARCHAR(30),                        -- B/L 번호

    -- 화물 정보
    TOTAL_PKG_QTY       INT,                                -- 총포장수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량

    -- 금액 정보
    FOB_VALUE           DECIMAL(18,2),                      -- FOB 가격
    FOB_VALUE_USD       DECIMAL(18,2),                      -- FOB 가격 (USD)
    CURRENCY_CD         CHAR(3),                            -- 통화

    -- 결제조건
    PAYMENT_TERM_CD     VARCHAR(20),                        -- 결제조건
    INCOTERMS_CD        VARCHAR(10),                        -- 인코텀즈

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DECLARED', -- 상태
    PERMIT_NO           VARCHAR(30),                        -- 수출허가번호
    PERMIT_DT           DATE,                               -- 수출허가일
    LOAD_COMPLETE_DT    DATE,                               -- 적재완료일

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID),
    FOREIGN KEY (BROKER_ID) REFERENCES MST_CUSTOMS_BROKER(BROKER_ID)
);

COMMENT ON TABLE CUS_EXPORT_DECLARATION IS '수출신고서';

-- 수출신고 품목
CREATE TABLE CUS_EXPORT_DECLARATION_ITEM (
    ITEM_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    EXPORT_DECL_ID      BIGINT          NOT NULL,           -- 수출신고
    LINE_NO             INT             NOT NULL,           -- 라인번호
    HS_CODE             VARCHAR(12)     NOT NULL,           -- HS코드
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    COMMODITY_DESC_EN   VARCHAR(500),                       -- 품명(영문)
    BRAND_NM            VARCHAR(100),                       -- 상표명
    MODEL_SPEC          VARCHAR(200),                       -- 규격
    COUNTRY_OF_ORIGIN   CHAR(2),                            -- 원산지
    QTY                 DECIMAL(12,3),                      -- 수량
    QTY_UNIT_CD         VARCHAR(10),                        -- 수량단위
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량
    UNIT_PRICE          DECIMAL(18,4),                      -- 단가
    TOTAL_PRICE         DECIMAL(18,2),                      -- 금액
    CURRENCY_CD         CHAR(3),                            -- 통화
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (EXPORT_DECL_ID) REFERENCES CUS_EXPORT_DECLARATION(EXPORT_DECL_ID)
);

COMMENT ON TABLE CUS_EXPORT_DECLARATION_ITEM IS '수출신고 품목';

-- ----------------------------------------------------------------------------
-- 7.3 수입신고서 (Import Declaration)
-- ----------------------------------------------------------------------------
CREATE TABLE CUS_IMPORT_DECLARATION (
    IMPORT_DECL_ID      BIGINT          PRIMARY KEY AUTO_INCREMENT,
    IMPORT_DECL_NO      VARCHAR(30)     UNIQUE NOT NULL,    -- 수입신고번호

    -- 연결 정보
    CUSTOMS_REQUEST_ID  BIGINT,                             -- 통관요청
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주
    BROKER_ID           BIGINT,                             -- 관세사

    -- 신고 정보
    CUSTOMS_OFFICE_CD   VARCHAR(10),                        -- 신고세관
    DECLARATION_DT      DATE,                               -- 신고일자
    ACCEPT_NO           VARCHAR(30),                        -- 수리번호
    ACCEPT_DT           DATE,                               -- 수리일자
    DECLARATION_TYPE_CD VARCHAR(20),                        -- 신고유형

    -- 수입자 정보
    IMPORTER_NM         VARCHAR(200),                       -- 수입자명
    IMPORTER_BIZ_NO     VARCHAR(20),                        -- 수입자사업자번호
    IMPORTER_ADDR       VARCHAR(500),                       -- 수입자주소

    -- 공급자 정보
    SUPPLIER_NM         VARCHAR(200),                       -- 공급자명
    SUPPLIER_COUNTRY    CHAR(2),                            -- 공급자국가

    -- 운송 정보
    ORIGIN_PORT_CD      VARCHAR(10),                        -- 출발항
    ARRIVAL_PORT_CD     VARCHAR(10),                        -- 도착항
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드
    BL_NO               VARCHAR(30),                        -- B/L 번호
    ARRIVAL_DT          DATE,                               -- 도착일

    -- 화물 정보
    TOTAL_PKG_QTY       INT,                                -- 총포장수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량

    -- 금액 정보
    INVOICE_AMT         DECIMAL(18,2),                      -- 송장금액
    INVOICE_CURR        CHAR(3),                            -- 송장통화
    CIF_VALUE           DECIMAL(18,2),                      -- CIF 가격
    CIF_VALUE_KRW       DECIMAL(18,2),                      -- CIF 가격 (원화)
    EXCHANGE_RATE       DECIMAL(18,6),                      -- 환율

    -- 세금 정보
    DUTY_AMT            DECIMAL(18,2),                      -- 관세
    SPECIAL_TAX_AMT     DECIMAL(18,2),                      -- 특별소비세
    EDU_TAX_AMT         DECIMAL(18,2),                      -- 교육세
    VAT_AMT             DECIMAL(18,2),                      -- 부가세
    TOTAL_TAX_AMT       DECIMAL(18,2),                      -- 총세금
    TAX_PAYMENT_DT      DATE,                               -- 세금납부일

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DECLARED', -- 상태
    PERMIT_NO           VARCHAR(30),                        -- 수입허가번호
    PERMIT_DT           DATE,                               -- 수입허가일
    RELEASE_DT          DATE,                               -- 반출일

    -- 결제조건
    PAYMENT_TERM_CD     VARCHAR(20),                        -- 결제조건
    INCOTERMS_CD        VARCHAR(10),                        -- 인코텀즈

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID),
    FOREIGN KEY (BROKER_ID) REFERENCES MST_CUSTOMS_BROKER(BROKER_ID)
);

COMMENT ON TABLE CUS_IMPORT_DECLARATION IS '수입신고서';

-- 수입신고 품목
CREATE TABLE CUS_IMPORT_DECLARATION_ITEM (
    ITEM_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    IMPORT_DECL_ID      BIGINT          NOT NULL,           -- 수입신고
    LINE_NO             INT             NOT NULL,           -- 라인번호
    HS_CODE             VARCHAR(12)     NOT NULL,           -- HS코드
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    BRAND_NM            VARCHAR(100),                       -- 상표명
    MODEL_SPEC          VARCHAR(200),                       -- 규격
    COUNTRY_OF_ORIGIN   CHAR(2),                            -- 원산지
    QTY                 DECIMAL(12,3),                      -- 수량
    QTY_UNIT_CD         VARCHAR(10),                        -- 수량단위
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량
    UNIT_PRICE          DECIMAL(18,4),                      -- 단가
    TOTAL_PRICE         DECIMAL(18,2),                      -- 금액
    CURRENCY_CD         CHAR(3),                            -- 통화
    CIF_VALUE_KRW       DECIMAL(18,2),                      -- CIF (원화)
    DUTY_RATE           DECIMAL(10,4),                      -- 관세율
    DUTY_AMT            DECIMAL(18,2),                      -- 관세
    VAT_AMT             DECIMAL(18,2),                      -- 부가세
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (IMPORT_DECL_ID) REFERENCES CUS_IMPORT_DECLARATION(IMPORT_DECL_ID)
);

COMMENT ON TABLE CUS_IMPORT_DECLARATION_ITEM IS '수입신고 품목';

-- ----------------------------------------------------------------------------
-- 7.4 AMS (Automated Manifest System - 세관사전신고)
-- ----------------------------------------------------------------------------
CREATE TABLE CUS_AMS (
    AMS_ID              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    AMS_NO              VARCHAR(30)     UNIQUE NOT NULL,    -- AMS 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    MBL_ID              BIGINT,                             -- MBL
    HBL_ID              BIGINT,                             -- HBL
    MAWB_ID             BIGINT,                             -- MAWB
    HAWB_ID             BIGINT,                             -- HAWB

    -- AMS 정보
    AMS_TYPE_CD         VARCHAR(20)     NOT NULL,           -- AMS유형 (US/CA/MX/IN 등)
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드
    MESSAGE_TYPE_CD     VARCHAR(20),                        -- 메시지유형 (ORIGINAL/AMENDMENT/CANCEL)

    -- 운송 정보
    CARRIER_CD          VARCHAR(10),                        -- 선사/항공사코드
    VESSEL_FLIGHT       VARCHAR(100),                       -- 선명/편명
    VOYAGE_NO           VARCHAR(30),                        -- 항차

    -- 출발/도착
    ORIGIN_PORT_CD      VARCHAR(10),                        -- 출발항
    DEST_PORT_CD        VARCHAR(10),                        -- 도착항
    ETD_DT              DATE,                               -- 출발예정일
    ETA_DT              DATE,                               -- 도착예정일

    -- BL/AWB 정보
    BL_NO               VARCHAR(30),                        -- B/L 번호
    AWB_NO              VARCHAR(15),                        -- AWB 번호

    -- 발송인/수하인
    SHIPPER_NM          VARCHAR(200),                       -- 발송인명
    SHIPPER_ADDR        VARCHAR(500),                       -- 발송인주소
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인명
    CONSIGNEE_ADDR      VARCHAR(500),                       -- 수하인주소
    NOTIFY_PARTY        VARCHAR(500),                       -- 통지처

    -- 화물 정보
    COMMODITY_DESC      VARCHAR(1000),                      -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드
    PKG_QTY             INT,                                -- 수량
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피

    -- 컨테이너/화물 상세
    CONTAINER_INFO      VARCHAR(1000),                      -- 컨테이너정보

    -- 전송 정보
    SEND_DTM            DATETIME,                           -- 전송일시
    SEND_STATUS_CD      VARCHAR(20)     DEFAULT 'PENDING',  -- 전송상태
    RESPONSE_CD         VARCHAR(20),                        -- 응답코드
    RESPONSE_MSG        VARCHAR(500),                       -- 응답메시지
    RESPONSE_DTM        DATETIME,                           -- 응답일시

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태
    HOLD_YN             CHAR(1)         DEFAULT 'N',        -- Hold 여부
    HOLD_REASON         VARCHAR(500),                       -- Hold 사유

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID)
);

COMMENT ON TABLE CUS_AMS IS 'AMS (세관사전신고)';

-- ----------------------------------------------------------------------------
-- 7.5 적하목록 (Manifest)
-- ----------------------------------------------------------------------------
CREATE TABLE CUS_MANIFEST (
    MANIFEST_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    MANIFEST_NO         VARCHAR(30)     UNIQUE NOT NULL,    -- 적하목록번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT,                             -- 선적건
    MBL_ID              BIGINT,                             -- MBL
    MAWB_ID             BIGINT,                             -- MAWB

    -- 신고 정보
    MANIFEST_TYPE_CD    VARCHAR(20)     NOT NULL,           -- 적하목록유형 (EXPORT/IMPORT)
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드
    CUSTOMS_OFFICE_CD   VARCHAR(10),                        -- 신고세관

    -- 운송 정보
    CARRIER_CD          VARCHAR(10),                        -- 선사/항공사코드
    CARRIER_NM          VARCHAR(100),                       -- 선사/항공사명
    VESSEL_FLIGHT       VARCHAR(100),                       -- 선명/편명
    VOYAGE_NO           VARCHAR(30),                        -- 항차
    CALL_SIGN           VARCHAR(20),                        -- 호출부호

    -- 출발/도착
    ORIGIN_PORT_CD      VARCHAR(10),                        -- 출발항
    DEST_PORT_CD        VARCHAR(10),                        -- 도착항
    ETD_DT              DATE,                               -- 출발예정일
    ETA_DT              DATE,                               -- 도착예정일
    ATD_DT              DATE,                               -- 실제출발일
    ATA_DT              DATE,                               -- 실제도착일

    -- 총화물 정보
    TOTAL_BL_COUNT      INT,                                -- 총 B/L 건수
    TOTAL_PKG_QTY       INT,                                -- 총 포장수량
    TOTAL_WEIGHT_KG     DECIMAL(12,3),                      -- 총 중량
    TOTAL_VOLUME_CBM    DECIMAL(12,4),                      -- 총 부피

    -- 전송 정보
    SEND_DTM            DATETIME,                           -- 전송일시
    SEND_STATUS_CD      VARCHAR(20)     DEFAULT 'PENDING',  -- 전송상태
    RESPONSE_CD         VARCHAR(20),                        -- 응답코드
    RESPONSE_MSG        VARCHAR(500),                       -- 응답메시지
    ACCEPT_NO           VARCHAR(30),                        -- 접수번호
    ACCEPT_DTM          DATETIME,                           -- 접수일시

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE CUS_MANIFEST IS '적하목록';

-- 적하목록 상세 (B/L별)
CREATE TABLE CUS_MANIFEST_DETAIL (
    MANIFEST_DTL_ID     BIGINT          PRIMARY KEY AUTO_INCREMENT,
    MANIFEST_ID         BIGINT          NOT NULL,           -- 적하목록
    LINE_NO             INT             NOT NULL,           -- 라인번호
    HBL_ID              BIGINT,                             -- HBL
    HAWB_ID             BIGINT,                             -- HAWB
    BL_NO               VARCHAR(30),                        -- B/L 번호
    SHIPPER_NM          VARCHAR(200),                       -- 발송인
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인
    NOTIFY_PARTY        VARCHAR(200),                       -- 통지처
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피
    CONTAINER_NO        VARCHAR(15),                        -- 컨테이너번호
    SEAL_NO             VARCHAR(30),                        -- 봉인번호
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (MANIFEST_ID) REFERENCES CUS_MANIFEST(MANIFEST_ID)
);

COMMENT ON TABLE CUS_MANIFEST_DETAIL IS '적하목록 상세';

-- ----------------------------------------------------------------------------
-- 7.6 EDI 전송 이력 (EDI Log)
-- ----------------------------------------------------------------------------
CREATE TABLE CUS_EDI_LOG (
    EDI_LOG_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    EDI_TYPE_CD         VARCHAR(20)     NOT NULL,           -- EDI유형 (AMS/MANIFEST/DECLARATION)
    REF_ID              BIGINT          NOT NULL,           -- 참조ID
    REF_NO              VARCHAR(30),                        -- 참조번호

    -- 전송 정보
    MESSAGE_TYPE_CD     VARCHAR(20),                        -- 메시지유형
    DIRECTION_CD        VARCHAR(10),                        -- 방향 (OUTBOUND/INBOUND)
    SEND_DTM            DATETIME,                           -- 전송일시
    RECEIVE_DTM         DATETIME,                           -- 수신일시

    -- 결과
    STATUS_CD           VARCHAR(20),                        -- 상태
    RESPONSE_CD         VARCHAR(20),                        -- 응답코드
    RESPONSE_MSG        VARCHAR(1000),                      -- 응답메시지
    ERROR_CD            VARCHAR(20),                        -- 에러코드
    ERROR_MSG           VARCHAR(1000),                      -- 에러메시지

    -- 메시지 내용
    MESSAGE_CONTENT     TEXT,                               -- 메시지내용

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE CUS_EDI_LOG IS 'EDI 전송 이력';

-- ----------------------------------------------------------------------------
-- 인덱스 생성
-- ----------------------------------------------------------------------------
CREATE INDEX IDX_CUS_REQUEST_SHIPMENT ON CUS_CUSTOMS_REQUEST(SHIPMENT_ID);
CREATE INDEX IDX_CUS_REQUEST_CUSTOMER ON CUS_CUSTOMS_REQUEST(CUSTOMER_ID);
CREATE INDEX IDX_CUS_EXPORT_SHIPMENT ON CUS_EXPORT_DECLARATION(SHIPMENT_ID);
CREATE INDEX IDX_CUS_IMPORT_SHIPMENT ON CUS_IMPORT_DECLARATION(SHIPMENT_ID);
CREATE INDEX IDX_CUS_AMS_SHIPMENT ON CUS_AMS(SHIPMENT_ID);
CREATE INDEX IDX_CUS_MANIFEST_MBL ON CUS_MANIFEST(MBL_ID);
CREATE INDEX IDX_CUS_EDI_LOG_REF ON CUS_EDI_LOG(EDI_TYPE_CD, REF_ID);
