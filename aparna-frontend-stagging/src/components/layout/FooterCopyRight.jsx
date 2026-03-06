import { _projectName_ } from "@/utils/helper/AllStaticVariables/configVariables";
import moment from "moment";
import Link from "next/link";

const FooterCopyRight = () => {
  const date = moment().format("YYYY");
  return (
    <div className="footer_policy_details">
      <div className="site-container">
        <div className="footer_policy_wrapper">
          <Link href="#." className="footer_policy_link">
            Terms & Conditions
          </Link>
          <Link href="#." className="footer_policy_link">
            Shipping
          </Link>
          <Link href="#." className="footer_policy_link">
            Policy Cancellation
          </Link>
          <Link href="#." className="footer_policy_link">
            Privacy Policy
          </Link>
        </div>
        <p className="footer_copy-right">
          &#169; {date} {_projectName_} All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default FooterCopyRight;
