import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";

import { IdQueryFilter } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/filters/id-query-filter";
import { ComparisonOperator } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/filters/comparison-operator";
import { EntityLoadConfiguration } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/entity-load-configuration";
import { RelationLoadOption } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/relation-load-option";
import { CultureLoadOption } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/culture-load-option";

const GetPublicLinks = (container) => {
  return {
    render(context) {
      ReactDOM.render(<CustomControl context={context} />, container);
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
};
function CustomControl({ context }) {
  const [Links, SetLinks] = useState([]);

  const clickHandler = async (context) => {
    if (context?.options?.entityId == null || context?.config?.baseUrl == null)
      return;

    const loadConfig = new EntityLoadConfiguration();
    loadConfig.relationLoadOption = RelationLoadOption.All;
    loadConfig.cultureLoadOption = CultureLoadOption.Default;

    const entity = await context.client.entities.getAsync(
      context.options.entityId,
      loadConfig
    );
    const relation = entity?.getRelation("AssetToPublicLink");

    if (relation != null) {
      const publicLinkPromises = relation.children.map(async (Child) => {
        const plQueryFilter = new IdQueryFilter({
          value: Child,
          operator: ComparisonOperator.Equals,
        });

        const publicLinkentity = await context.client.entities.getAsync(Child);
        if (publicLinkentity != null) {
          const relativeUrl = await publicLinkentity.getPropertyValue(
            "RelativeUrl"
          );
          const versionHash = await publicLinkentity.getPropertyValue(
            "VersionHash"
          );
          return `${context?.config?.baseUrl}/api/public/content/${relativeUrl}?v=${versionHash}`;
        }
      });

      const publicLinks = await Promise.all(publicLinkPromises);
      if (publicLinks.length < 1)
        alert("No public link created for this Asset");
      SetLinks(publicLinks);
      console.log(publicLinks);
    }
  };
  return (
    <div>
      <Button
        variant="contained"
        disableElevation
        onClick={() => clickHandler(context)}
        style={{ backgroundColor: "green" }}
      >
        Get All Public Links
      </Button>
      <ul style={{ color: "#067706", fontWeight: "bold", fontStyle: "italic" }}>
        {Links.map((link) => (
          <li key={link}>{link}</li>
        ))}
      </ul>
    </div>
  );
}
export default GetPublicLinks;
