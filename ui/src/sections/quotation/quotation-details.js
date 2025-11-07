import PropTypes from "prop-types";
import { Page, View, Text, Image, Document, Font, StyleSheet } from "@react-pdf/renderer";
import { fDate } from "src/utils/format-time";

// FONT
Font.register({
    family: "Roboto",
    fonts: [
        { src: "/fonts/Roboto-Regular.ttf" },
        { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
    ],
});

// STYLES
const styles = StyleSheet.create({
    page: {
        fontFamily: "Roboto",
        fontSize: 10,
        padding: 24,
        lineHeight: 1.4,
    },

    headerRow: {
        flexDirection: "row",
        marginBottom: 20,
    },

    logo: { width: 80, height: 80 },

    // ✅ ADDED MORE GAP BETWEEN LOGO & COMPANY TEXT
    titleSection: {
        marginLeft: 60, 
        flex: 1,
    },

    title: { fontSize: 14, fontWeight: "bold" },
    bodyText: { fontSize: 10 },
    section: { marginTop: 10 },
    h6: { fontSize: 12, fontWeight: "bold", marginBottom: 3 },
    h5:{fontSize: 12, fontWeight: "bold", marginBottom: 3 ,textDecoration:'underline' },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#999",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#eee",
        borderBottomWidth: 1,
        padding: 6,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        padding: 6,
    },
    cell1: { width: "15%" },
    cell2: { width: "45%" },
    cell3: { width: "20%" },
    cell4: { width: "20%" },
    bullet: { marginBottom: 4, fontSize: 10 },
    centerText: { textAlign: "center", marginTop: 10 , fontWeight:'bold'  },
});

// MAIN COMPONENT
export default function QuotationPDF({ quotation }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* ---------------- HEADER ---------------- */}
                <View style={styles.headerRow}>
                    <Image src="/logo/hylite_logo.png" style={styles.logo} />

                    <View style={styles.titleSection}>
                   
                        <Text style={styles.title}>HYLITE GALVANIZERS INDIA PRIVATE LIMITED.</Text>

                        <Text style={styles.bodyText}>
                            M37, MIDC, Taloja Navi Mumbai, Dist- Raigarh, Maharashtra -410208.
                        </Text>
                        <Text style={styles.bodyText}>Tel:-+91 8600259300/9820226331,</Text>
                        <Text style={styles.bodyText}>Email- taloja@hylite.co.in </Text>
                        <Text style={styles.bodyText}>Website-www.hylite.co.in</Text>
                        <Text style={styles.h6}>  GST No:- 27AABCH8499L1ZS</Text>
                    </View>
                </View>

                {/* ---------------- DATE + REF ---------------- */}
                <View style={styles.section}>
                    <Text style={styles.h6}>{fDate(quotation?.createdAt)}</Text>
                    <Text style={styles.h6}>RFQ-{quotation?.id}</Text>
                </View>

                {/* ---------------- ADDRESS BLOCK ---------------- */}
                <View style={styles.section}>
                    <Text style={styles.h6}>To,</Text>
                    <Text style={styles.h6}>Name: {quotation?.customer?.firstName} {quotation?.customer?.lastName} .</Text>
                    <Text style={styles.h6}>Address: {quotation?.customer?.fullAddress} .</Text>
                    <Text style={styles.h6}>Phone: {quotation?.customer?.phoneNumber} .</Text>
                </View>

                {/* ---------------- INTRO TEXT ---------------- */}
                <View style={styles.section}>
                    <Text>We thank you for your enquiry and are pleased to quote our lowest rates.</Text>
                </View>

                {/* ---------------- MATERIAL TABLE ---------------- */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.cell1}>Sr No</Text>
                        <Text style={styles.cell2}>Material Type</Text>
                        <Text style={styles.cell3}>Quantity</Text>
                        <Text style={styles.cell4}>Cost per kg</Text>
                    </View>

                    {quotation?.materials?.map((item, i) => (
                        <View style={styles.tableRow} key={i}>
                            <Text style={styles.cell1}>{i + 1}</Text>
                            <Text style={styles.cell2}>{item.materialType}</Text>
                            <Text style={styles.cell3}>{item.quantity} {item.billingUnit}</Text>
                            <Text style={styles.cell4}>{item.pricePerUnit} /-</Text>
                        </View>
                    ))}
                </View>

                {/* ---------------- TERMS ---------------- */}
                <View style={styles.section}>
                    <Text style={styles.h5}>Terms & Conditions:</Text>

                    <Text style={styles.bullet}>• This quotation is for Hot Dip Galvanising only.</Text>
                    <Text style={styles.bullet}>• Packaging would be extra as per specifications.</Text>
                    <Text style={styles.bullet}>• Taxes: 9% CGST + 9% SGST extra.</Text>
                    <Text style={styles.bullet}>• If Sandblasting required Rs 6 per kg extra.</Text>
                    <Text style={styles.bullet}>• Transportation: Ex Taloja.</Text>
                    <Text style={styles.bullet}>• Validity of PO: 5 days.</Text>
                    <Text style={styles.bullet}>• Raw materials costing is as per today’s prevailing market rates.</Text>
                    <Text style={styles.bullet}>• Rates valid only for full order quantity only.</Text>

                    <Text style={styles.centerText}>
                      Thank you for your inquiry, we await your PO for the same.
                    </Text>
                </View>

                {/* ---------------- LONG TERMS BLOCK ---------------- */}
                <View style={styles.section}>
                    <Text style={styles.h5}>
                        Terms & Conditions :– Fabrication and Galvanizing Plant
                    </Text>

                    <Text style={styles.bullet}>• Prices quoted are based on weight of materials after galvanizing, as recorded on our electronic weigh-bridge. .</Text>
                    <Text style={styles.bullet}>• Prices quoted are valid only for 5 days. Price shall revise every 5 days depending on zinc fluctuation.</Text>
                    <Text style={styles.bullet}>• Unless otherwise specified, prices are ex-our works, i.e. transportation to and from our works is to be arranged by the customer. </Text>
                    <Text style={styles.bullet}>• Raw Material TC is to be provided in case of sending material for galvanising .</Text>
                    <Text style={styles.bullet}>• Invoicing will be on weight of Post Galvanising.</Text>
                    <Text style={styles.bullet}>• Materials for Galvanizing should be free from Paint, Lacquer, Varnish, tar etc marks. If present, they must be sand-blasted by the customer prior to sending them to us.</Text>
                    <Text style={styles.bullet}>• Holes/Vents/Crops on the materials, wherever required, should be provided by the customer for the purpose of Hooking and / or Zinc drainage (as per ASTM/A- 385).</Text>
                    <Text style={styles.bullet}>• Thin gauge materials (like sheets, covers, etc.) are likely to get distorted/warped in the high temperature of the Galvanizing Bath, for which we cannot be held responsible. Such un avoidance is agreed to by the Galvanizing Standards, being outside the control of the Galvaniser. We invite our Customers to consider our advises on design to minimize such distortions / war page. There is a separate specification, ASTM/A-384, on this subject.</Text>
                    <Text style={styles.bullet}>• Materials with threaded portions shall be re-tapped after Hot Dip Galvanizing by the customer and is not in our scope of works.</Text>
                    <Text style={styles.bullet}>• Our Galvanizing confirms to ASTM/A-123M-97a (for structures), ASTM/A-153 (for Hardware), ASTM / A-767/767-M (for Rebars), or BS-729 or their international equivalents. If the customer’s project specifies specifications other than these, it must be viewed by our Technical Department prior to finalization of prices, as it may require excessive Zinc Coating.</Text>
                    <Text style={styles.bullet}>• We are certified to ISO-9001:2015. </Text>
                    <Text style={styles.bullet}>• If QA Inspection is required by the customer, it must be arranged at our works prior to delivery of Galvanized Material. </Text>
                    <Text style={styles.bullet}>• Customers are requested to give authority letter to their Drivers for collecting their Galvanized materials. </Text>
                    <Text style={styles.bullet}>• Delivery period specified is subject to force untoward incident clause, like plant breakdown, availability of raw materials, etc. </Text>
                    <Text style={styles.bullet}>• Galvanized materials are to be collected within 48 hours from date of intimation of readiness; else a ground charge of Rs 500 per MT per day will be levied. </Text>
                    <Text style={styles.bullet}>• Working hours for receiving and dispatching materials are 09:00 a.m. to 06:30.p.m Sunday weekly off.  </Text>
                </View>

            </Page>
        </Document>
    );
}

QuotationPDF.propTypes = {
    quotation: PropTypes.object,
};
