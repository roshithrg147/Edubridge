package com.edubridge.vaultservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.io.File;

@SpringBootApplication
@EnableScheduling
public class EdubridgeVaultApplication {

    private static void purgeStaleMigrations() {
        File v3Bad = new File("src/main/resources/db/migration/V3__academic_metadata.sql");
        File v3Good = new File("src/main/resources/db/migration/V3__add_academic_metadata.sql");
        if (v3Bad.exists() && !v3Good.exists()) {
            v3Bad.renameTo(v3Good);
            System.out.println("Early Boot: Renamed V3__academic_metadata.sql to V3__add_academic_metadata.sql");
        }

        File v3BadClass = new File("target/classes/db/migration/V3__academic_metadata.sql");
        File v3GoodClass = new File("target/classes/db/migration/V3__add_academic_metadata.sql");
        if (v3BadClass.exists() && !v3GoodClass.exists()) {
            v3BadClass.renameTo(v3GoodClass);
        }

        String[] filesToDelete = {
                "src/main/resources/db/migration/V2__outbox_and_metadata.sql",
                "target/classes/db/migration/V2__outbox_and_metadata.sql"
        };
        for (String path : filesToDelete) {
            File f = new File(path);
            if (f.exists()) {
                f.delete();
                System.out.println("Early Boot: Purged stale migration -> " + path);
            }
        }
    }

    public static void main(String[] args) {
        purgeStaleMigrations();
        SpringApplication.run(EdubridgeVaultApplication.class, args);
    }

}
