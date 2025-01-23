import { ActionPanel, List, Action, showToast, Toast, popToRoot } from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";

interface Account {
  accountId: string;
  name: string;
}

export default function Command() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Fetch AWS accounts using AWS CLI or mock data
      const output = execSync(
        "/Users/jacob.fleming-gale/src/aws-sso-cli-profile/dist/aws-sso-cli-profile_darwin_arm64_v8.0/aws-sso-cli-profile raycast"
      );
      const parsed: Account[] = JSON.parse(output.toString()).map((item: any) => ({
        accountId: item.accountId,
        name: item.name,
      }));
      setAccounts(parsed);
      setFilteredAccounts(parsed);
    } catch (error) {
      console.error("Failed to fetch AWS accounts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredAccounts(accounts);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredAccounts(
        accounts.filter(
          (account) =>
            account.name.toLowerCase().includes(lowerQuery) ||
            account.accountId.includes(query)
        )
      );
    }
  };

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={handleSearch} // Real-time search
      searchBarPlaceholder="Search AWS accounts by name or ID"
    >
      {filteredAccounts.map((account) => (
        <List.Item
          key={account.name}
          title={account.name + " " + account.accountId}
          subtitle={account.accountId}
          actions={
            <ActionPanel>
              <Action
                title="Open AWS Console"
                onAction={() => {
                  try {
                    // Login to the AWS account and open the console
                    execSync(`PATH=/usr/bin /opt/homebrew/bin/aws-sso console -p ${account.name} --browser Safari`);
                    popToRoot(); // Close Raycast window
                  } catch (error) {
                    console.error("Failed to open AWS Console:", error);
                    showToast(Toast.Style.Failure, "Failed to open AWS Console");
                  }
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
