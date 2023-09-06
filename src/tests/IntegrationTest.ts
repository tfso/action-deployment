import { Secrets } from "../Secrets";
import fetch from "node-fetch";

const url =
  "https://deployment.api.24sevenoffice.com/container-upgradev3/deployment:beta-bank:tfso-api-bank-permission";
const body = JSON.stringify({
  TAZURE_SAS_NAME: "RootManageSharedAccessKey",
  TAZURE_SAS_KEY: "oFvJUrUfBJRROc4WrNC5JPmWMH15RkRo5cGBCsjF7qE",
  TAZURE_TOPICS:
    "bankpayout,bankpayoutchange,bankpayoutapprove,bankpayoutsign,bankpayoutcancel,bankpayoutdelete,bankpayoutbook,banksettings,bankagreement,bankagreementadmin,bankagreementapprove,bank,bankpayoutproposaldelete,bankaccountbalance,bankincomingpayment,bankincomingpaymentchange,bankincomingpaymentdelete,bankincomingpaymentpost,bankreconciliation,bankreconciliationchange,bankreconciliationdelete,bankreconciliationpost,crm.bankdetails",
  TSTARTUP_FILE: "worker",
});

const test = async () => {
  const secret = new Secrets(
    "mAthqGfBVBcDJ68AMJL3CHbCHZ894Fan7BgH8mL",
    new URL(url)
  );
  await secret.postSecretsString(body, fetch);
};

test();
