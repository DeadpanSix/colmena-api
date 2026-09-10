-- CreateTable
CREATE TABLE `document_sequence` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `current` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
