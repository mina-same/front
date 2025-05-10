'use client';

import React from "react";
import Layout from "../../../../components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import ReservationWizard from "./ReservationWizard";

const ContactClient = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <ReservationWizard />
        </Layout>
    );
};

export default ContactClient;