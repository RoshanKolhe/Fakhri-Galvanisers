import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { useMemo } from "react";

Font.register({
    family: 'Roboto',
    fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () =>
    useMemo(
        () =>
            StyleSheet.create({
                page: {
                    fontSize: 9,
                    lineHeight: 1.6,
                    fontFamily: 'Roboto',
                    backgroundColor: '#FFFFFF',
                    textTransform: 'capitalize',
                    padding: '40px 24px 120px 24px',
                },
                container: {
                    border: '1px solid black',
                },
                firstSection: {
                    width: '100%',
                    flexDirection: 'row',
                },

                addressSection: {
                    width: '60%',
                    padding: 4,
                    textAlign: 'justify',
                    borderRight: '1px solid black',
                    borderBottom: '1px solid black',
                },

                addressText: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    marginBottom: 2,
                },

                challanSection: {
                    width: '40%',
                    flexDirection: 'column',
                },

                challanBlock: {
                    flexDirection: 'row',
                    borderBottom: '1px solid black',
                },

                challanLabel: {
                    width: '50%',
                    padding: 2,
                    borderRight: '1px solid black',
                    fontSize: 8,
                    fontWeight: 'bold',
                },

                challanValue: {
                    width: '50%',
                    padding: 2,
                    fontSize: 8,
                },
                table: {
                    display: 'table',
                    width: 'auto',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderRightWidth: 0,
                    borderBottomWidth: 0,
                },
                tableRow: {
                    flexDirection: 'row',
                },
                tableCell: {
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderLeftWidth: 0,
                    borderTopWidth: 0,
                    padding: 4,
                    fontSize: 8,
                    flex: 1,
                },
                headerTitle: {
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 'bold',
                    marginBottom: 8,
                }
            }),
        []
    );

export default function OrderQcTestTemplatePdf({ orderDetails }) {
    const styles = useStyles();

    const totalQuantity = orderDetails?.materials?.reduce((sum, material) => sum + (Number(material?.totalQuantity) || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    {/* First block */}
                    <View style={styles.firstSection}>
                        {/* Address section */}
                        <View style={styles.addressSection}>
                            <Text style={styles.addressText}>
                                {orderDetails?.customer?.fullAddress || 'NA'},
                            </Text>
                            <Text style={styles.addressText}>{orderDetails?.customer?.city || 'NA'}</Text>
                            <Text style={styles.addressText}>{orderDetails?.customer?.state || 'NA'}</Text>
                            <Text style={[styles.addressText, { marginTop: 8 }]}>
                                Client Name:- {orderDetails?.customer?.firstName || ''}
                            </Text>
                        </View>

                        {/* Challan Details */}
                        <View style={styles.challanSection}>
                            <View style={styles.challanBlock}>
                                <Text style={styles.challanLabel}>T.C.No.</Text>
                                <Text style={styles.challanValue}>{orderDetails?.tcNo || 'NA'}</Text>
                            </View>
                            <View style={styles.challanBlock}>
                                <Text style={styles.challanLabel}>T.C.Date.</Text>
                                <Text style={styles.challanValue}>{orderDetails?.tcDate ? format(new Date(orderDetails?.tcDate), 'dd-MM-yyyy') : 'NA'}</Text>
                            </View>
                            <View style={styles.challanBlock}>
                                <Text style={styles.challanLabel}>Our Challan No.</Text>
                                <Text style={styles.challanValue}>{orderDetails?.ourChallanNo || 'NA'}</Text>
                            </View>
                            <View style={styles.challanBlock}>
                                <Text style={styles.challanLabel}>Our Challan Date.</Text>
                                <Text style={styles.challanValue}>{orderDetails?.ourChallanDate ? format(new Date(orderDetails?.ourChallanDate), 'dd-MM-yyyy') : 'NA'}</Text>
                            </View>
                            <View style={styles.challanBlock}>
                                <Text style={styles.challanLabel}>Party Challan No.</Text>
                                <Text style={styles.challanValue}>{orderDetails?.challan?.challanId || 'NA'}</Text>
                            </View>
                            <View style={styles.challanBlock}>
                                <Text style={styles.challanLabel}>Party Challan Date.</Text>
                                <Text style={styles.challanValue}>{orderDetails?.challan?.createdAt ? format(new Date(orderDetails?.challan?.createdAt), 'dd-MM-yyyy') : 'NA'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Material description table */}
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={{ textAlign: 'center', width: '20%', ...styles.tableCell }}>Sr.No</Text>
                            <Text style={{ textAlign: 'center', width: '60%', ...styles.tableCell }}>Material Description</Text>
                            <Text style={{ textAlign: 'center', width: '20%', ...styles.tableCell }}>QTY(NOS)</Text>
                        </View>
                        {
                            orderDetails?.materials?.length > 0 && orderDetails?.materials?.map((material, index) => (
                                <View style={styles.tableRow}>
                                    <Text style={{ textAlign: 'center', width: '20%', ...styles.tableCell }}>{index + 1}</Text>
                                    <Text style={{ width: '60%', ...styles.tableCell }}>{material?.materialType}</Text>
                                    <Text style={{ textAlign: 'center', width: '20%', ...styles.tableCell }}>{material?.totalQuantity}</Text>
                                </View>
                            ))
                        }
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>
                                {/*  */}
                            </Text>
                            <Text style={{ textAlign: 'center', ...styles.tableCell }} colSpan={2}>TOTAL</Text>
                            <Text style={{ textAlign: 'center', ...styles.tableCell }}>{totalQuantity}</Text>
                        </View>
                    </View>

                    {/* Inspection note section */}
                    <View style={{ display: 'block', width: '100%' }}>
                        <Text style={{ textAlign: 'center', textDecoration: 'underline' }}>
                            INSPECTION
                        </Text>
                        <Text style={{ textAlign: 'justify' }}>
                            SAMPLE FROM THE ABOVE QUANTITY FOR GALAVANIZING THICKNESS AND SURFACE APPEARANCE FOUND SATISFACTORY TESTING
                            OF THE ABOVE MATERIALS WERE CARRIED OUT AS PER S/B.S/ASTM/SPECIFICATION DETAILS OF WHICH ARE AS UNDER
                        </Text>
                    </View>

                    {/* Inspection table */}
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Sr.No</Text>
                            <Text style={styles.tableCell}>Specification</Text>
                            <Text style={styles.tableCell}>Test Details</Text>
                            <Text style={styles.tableCell}>Requirement</Text>
                            <Text style={styles.tableCell}>Test Results</Text>
                            <Text style={styles.tableCell}>Observed</Text>
                        </View>
                        {
                            orderDetails?.orderQcTests?.length > 0 && orderDetails?.orderQcTests?.map((test, index) => (
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{index + 1}</Text>
                                    <Text style={styles.tableCell}>{test.specification}</Text>
                                    <Text style={styles.tableCell}>{test.testDetails}</Text>
                                    <Text style={styles.tableCell}>{test.requirement}</Text>
                                    <Text style={styles.tableCell}>{test.testResult}</Text>
                                    <Text style={styles.tableCell}>{test.observed}</Text>
                                </View>
                            ))
                        }
                    </View>

                    {/* Note section */}
                    <View style={{ display: 'block', width: '100%', borderBottom: '2px solid black' }}>
                        <Text style={{ textAlign: 'justify' }}>
                            ON THE ABOVE INSPECTION & TESTING, MATERIAL FOUND CONFIRMED TO RELEVENT SPECIFICATION AND HENCE QUALITY
                            OF MATERIAL WERE FOUND SATISFACTORY.
                        </Text>
                    </View>

                    {/* Footer */}
                    <View style={{ width: '100%', display: 'flex', flexDirection: 'row', height: '50px' }}>
                        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '20px', width: '60%', borderRight: '2px solid black' }}>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px', width: '40%' }}>
                                <Text>Inspection Authority</Text>
                                <Text>Client</Text>
                            </View>
                        </View>
                        <View style={{ width: '40%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', }}>
                            <Text>FOR FAKHRI GALVANISERS PRIVATE LIMITED</Text>
                            <Text>QA Head Signature</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document >
    )
}

OrderQcTestTemplatePdf.propTypes = {
    orderDetails: PropTypes.object,
}
