import "swiper/css";
import "../../../public/assets/css/tailwind.css";
import "../../../public/assets/css/tailwind-built.css";
import "../../../public/assets/css/animate.min.css";
import "../../../public/assets/css/custom.css";

// Translations
import initTranslations from "../../i18n";
import TranslationsProvider from "../../../components/TranslationsProvider";

// Fonts
import { Poppins, Montserrat } from "next/font/google";

const poppins = Poppins({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--poppins",
	display: "swap",
});

const montserrat = Montserrat({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--montserrat",
	display: "swap",
});


export const metadata = {
	title: "cantrot Horses",
	description: "The Best place for horses and horses owners",
};

export default async function RootLayout({ children, params }) {
	const locale = params?.locale || params.locale;
	if (!locale) return null;
	const { resources } = await initTranslations(locale, [
		"home",
		"about",
		"header",
		"servicesPage",
		"contact",
		"signup",
		"login",
		"user",
		"footer",
		"publicServices",
		"publicMarket",
		"profile",
		"forgetPassword",
		"resetPassword",
		"serviceDetails",
		"horseDetails",
		"horsePage",
		"coursesPage",
		"booksPage",
		"resourcesPage",
		"addBook",
		"addCourse",
		"addProduct",
		"addStable",
		"stablesPage",
		"stableDetails",
		"reservationPopup",
		"supplierStores",
		"competitionsPage",
		"balance",
		"addCompetition",
		"editCompetition",
		"notFound",
		"invitations",
		"bookDetails",
		"courseDetails",
		"product",
		"productsPage",
		"productView"
	]);

	return (
		<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={locale === 'ar' ? 'rtl' : 'ltr'}>
			<body className={`${poppins.variable} ${montserrat.variable} ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
				<TranslationsProvider
					locale={locale}
					namespaces={["home", "competitionsPage", "addCompetition", "editCompetition", "notFound", "invitations", "profile", "resourcesPage", "bookDetails", "contact", "product"]}
					resources={resources}
				>
					{children}
				</TranslationsProvider>
			</body>
		</html>
	);
}