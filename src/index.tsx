import { Action, ActionPanel, List, showToast, Toast, closeMainWindow } from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";

interface Account {
  accountId: string;
  name: string;
}

export default function Command() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Fetch AWS accounts using AWS CLI or mock data
      const output = execSync(
        "/opt/homebrew/bin/aws-sso-cli-profile raycast"
      );
      const parsed: Account[] = JSON.parse(output.toString()).map((item: any) => ({
        accountId: item.accountId,
        name: item.name,
      }));
      setAccounts(parsed);
    } catch (error) {
      console.error("Failed to fetch AWS accounts:", error);
      showToast(Toast.Style.Failure, "Failed to fetch AWS accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelect = (account: Account) => {
    try {
      // Login to the AWS account and open the console
      execSync(`PATH=/usr/bin /opt/homebrew/bin/aws-sso console -p ${account.name} --browser Safari`);
      showToast(Toast.Style.Success, `Opened AWS Console for ${account.name}`);
    //   popToRoot(); // Close Raycast window
      closeMainWindow({ clearRootSearch: true });
    } catch (error) {
      console.error("Failed to open AWS Console:", error);
      showToast(Toast.Style.Failure, "Failed to open AWS Console");
    }
  };

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search AWS accounts...">
      {accounts.map((account) => (
        <List.Item
          key={account.name}
          title={account.name + " " + account.accountId}
          subtitle={account.accountId}
          actions={
            <ActionPanel>
              <Action title="Open AWS Console" onAction={() => handleSelect(account)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
