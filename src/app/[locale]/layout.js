import "swiper/css";
import "../../../public/assets/css/tailwind.css";
import "../../../public/assets/css/tailwind-built.css";
import "../../../public/assets/css/animate.min.css";

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
	title: "Taiara Horses",
	description: "The Best place for horses and horses owners",
};

export default async function RootLayout({ children, params }) {
	const locale = params?.locale;
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
		"addBook",
		"addCourse",
		"addProduct",
	]);

	return (
		<html lang={locale}>
			<body className={`${poppins.variable} ${montserrat.variable}`}>
					<TranslationsProvider
						locale={locale}
						namespaces={["home"]}
						resources={resources}
					>
							{children}
					</TranslationsProvider>
			</body>
		</html>
	);
}