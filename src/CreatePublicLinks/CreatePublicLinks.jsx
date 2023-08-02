import ReactDOM from "react-dom";
import React, { useState } from "react";
import Button from "@mui/material/Button";

import { IdQueryFilter } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/filters/id-query-filter";
import { ComparisonOperator } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/filters/comparison-operator";
import { EntityLoadConfiguration } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/entity-load-configuration";
import { RelationLoadOption } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/relation-load-option";
import { PropertyLoadOption } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/property-load-option";
import { IChildToManyParentsRelation } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/base/relations/child-to-many-parents-relation";

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
// ... Your other imports and code ...

function CustomControl({ context }) {
  const clickHandler = async () => {
    if (
      context?.options?.entityId == null ||
      context?.config?.renditions == null
    )
      return;

    const renditions = context.config.renditions;
    const rendtionArray = renditions.split(",");
    const loadConfig = new EntityLoadConfiguration();
    loadConfig.relationLoadOption = RelationLoadOption.All;
    loadConfig.propertyLoadOption = PropertyLoadOption.All;
    loadConfig.cultureLoadOption = CultureLoadOption.Default;

    const entity = await context.client.entities.getAsync(
      context.options.entityId,
      loadConfig
    );

    // Make sure the property exists and is a string
    const fileName = entity.getPropertyValue("Filename");
    if (typeof fileName !== "string") {
      console.error("Invalid filename or filename is missing.");
      return;
    }

    const parts = fileName.split(".");
    if (parts.length > 1) {
      const fileNameWithoutExtension = parts.slice(0, -1).join(".");
      console.log(fileNameWithoutExtension);
      rendtionArray.forEach(async (element) => {
        const publicLink = await context.client.entityFactory.createAsync(
          "M.PublicLink"
        );

        await publicLink.loadMembersAsync(
          new PropertyLoadOption("Resource"),
          new RelationLoadOption("AssetToPublicLink")
        );

        const specialCharsPattern = /[^a-zA-Z0-9-]+/g;
        const resultString = element.replace(specialCharsPattern, "-");
        publicLink.setPropertyValue("Resource", element);
        publicLink.setPropertyValue(
          "RelativeUrl",
          fileNameWithoutExtension + "/" + resultString
        );

        const relation = publicLink.getRelation("AssetToPublicLink");
        relation.addRange([context.options.entityId]);
        console.log(relation);

        // Save the public link entity
        try {
          await context.client.entities.saveAsync(publicLink);
          alert("Public link has been created for " + element);
        } catch (error) {
          console.log(error);
          alert("Something went wrong! Plese check the logs");
        }
      });
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        disableElevation
        onClick={clickHandler} // Call the clickHandler directly without an anonymous arrow function
      >
        Create Public Link
      </Button>
    </div>
  );
}

// ... Your other exports ...
export default GetPublicLinks;
